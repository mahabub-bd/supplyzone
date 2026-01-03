import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { AccountTransaction } from 'src/account/entities/account-transaction.entity';
import { Account } from 'src/account/entities/account.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StockMovement, StockMovementType } from 'src/inventory/entities/stock-movement.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { Between, DataSource, Repository } from 'typeorm';

import { ApprovePurchaseReturnDto } from './dto/approve-purchase-return.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { ProcessPurchaseReturnDto } from './dto/process-purchase-return.dto';
import { RefundPurchaseReturnDto } from './dto/refund-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseReturnItem } from './entities/purchase-return-item.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseOrderStatus } from './enums/purchase-order-status.enum';
import {
  PurchaseReturnStatus,
  isStatusTransitionValid,
} from './enums/purchase-return-status.enum';

@Injectable()
export class PurchaseReturnService {
  constructor(
    @InjectRepository(PurchaseReturn)
    private returnRepo: Repository<PurchaseReturn>,
    @InjectRepository(PurchaseReturnItem)
    private returnItemRepo: Repository<PurchaseReturnItem>,
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepo: Repository<PurchaseItem>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement) private stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(Warehouse) private warehouseRepo: Repository<Warehouse>,
    @InjectRepository(AccountTransaction)
    private transactionRepo: Repository<AccountTransaction>,
    private dataSource: DataSource,
    private accountService: AccountService,
  ) {}

  async create(dto: CreatePurchaseReturnDto) {
    // Check for duplicate return number
    if (dto.return_no) {
      const existingReturn = await this.returnRepo.findOne({
        where: { return_no: dto.return_no },
      });
      if (existingReturn) {
        throw new BadRequestException(
          `Return Number "${dto.return_no}" already exists`,
        );
      }
    }

    // Validate purchase exists and is received
    const purchase = await this.purchaseRepo.findOne({
      where: { id: dto.purchase_id },
      relations: ['supplier', 'items'],
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase ID ${dto.purchase_id} not found`);
    }
    if (purchase.status !== PurchaseOrderStatus.FULLY_RECEIVED) {
      throw new BadRequestException('Can only return from received purchases');
    }

    // Validate supplier exists
    const supplier = await this.supplierRepo.findOne({
      where: { id: dto.supplier_id },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier ID ${dto.supplier_id} not found`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: dto.warehouse_id },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse ID ${dto.warehouse_id} not found`);
    }

    // Calculate total and validate return quantities
    const total = dto.items.reduce((sum, item) => {
      const lineTotal = item.price * item.returned_quantity;
      return sum + lineTotal;
    }, 0);

    // Validate return quantities against original purchase quantities
    for (const returnItem of dto.items) {
      const purchaseItem = purchase.items.find(
        (pi) => pi.product_id === returnItem.product_id,
      );
      if (!purchaseItem) {
        throw new BadRequestException(
          `Product ID ${returnItem.product_id} not found in original purchase`,
        );
      }

      // Check if we're not returning more than purchased
      const totalReturnedForProduct = await this.returnItemRepo
        .createQueryBuilder('returnItem')
        .leftJoin('returnItem.purchase_return', 'purchaseReturn')
        .leftJoin('purchaseReturn.purchase', 'purchase')
        .where('purchase.id = :purchaseId', { purchaseId: dto.purchase_id })
        .andWhere('returnItem.product_id = :productId', {
          productId: returnItem.product_id,
        })
        .andWhere('purchaseReturn.status IN (:...statuses)', {
          statuses: ['approved', 'processed'],
        })
        .select('SUM(returnItem.returned_quantity)', 'totalReturned')
        .getRawOne()
        .then((result) => parseInt(result?.totalReturned || '0'));

      if (
        totalReturnedForProduct + returnItem.returned_quantity >
        purchaseItem.quantity
      ) {
        throw new BadRequestException(
          `Cannot return ${returnItem.returned_quantity} units of product ${returnItem.product_id}. ` +
            `Original purchase: ${purchaseItem.quantity}, Already returned: ${totalReturnedForProduct}`,
        );
      }
    }

    // Generate return number if not provided
    const return_no = dto.return_no || (await this.generateReturnNumber());

    // Create purchase return with basic properties
    const purchaseReturn = {
      return_no,
      purchase_id: dto.purchase_id,
      supplier_id: dto.supplier_id,
      warehouse_id: dto.warehouse_id,
      reason: dto.reason,
      status: dto.status || PurchaseReturnStatus.DRAFT,
      total,
    };

    // Save purchase return to generate ID
    const savedReturn = await this.returnRepo.save(purchaseReturn);

    // Prepare purchase return items
    const items = dto.items.map((item) => ({
      purchase_return_id: savedReturn.id,
      purchase_item_id: item.purchase_item_id,
      product_id: item.product_id,
      returned_quantity: item.returned_quantity,
      price: item.price,
      line_total: item.price * item.returned_quantity,
    }));

    await this.returnItemRepo.save(items);

    const createdPurchaseReturn = await this.returnRepo.findOne({
      where: { id: savedReturn.id },
      relations: [
        'items',
        'items.product',
        'supplier',
        'warehouse',
        'purchase',
        'approved_user',
        'processed_user',
      ],
    });

    // Add refund transactions to the purchase return
    createdPurchaseReturn['refund_history'] = await this.getRefundTransactions(
      createdPurchaseReturn.id,
    );

    return createdPurchaseReturn;
  }

  private async getRefundTransactions(purchaseReturnId: number) {
    const transactions = await this.transactionRepo.find({
      where: {
        reference_type: 'supplier_refund',
        reference_id: purchaseReturnId,
      },
      relations: ['entries', 'entries.account'],
      order: { created_at: 'DESC' },
    });

    // Transform to simple format like payment_history
    return transactions.map((tx) => {
      const debitEntry = tx.entries.find((entry) => entry.debit > 0);
      const creditEntry = tx.entries.find((entry) => entry.credit > 0);

      return {
        id: tx.id,
        type: 'supplier_refund',
        amount:
          debitEntry?.debit.toString() || creditEntry?.credit.toString() || '0',
        method: debitEntry?.account?.name || 'Unknown',
        note:
          debitEntry?.narration ||
          creditEntry?.narration ||
          'Refund transaction',
        purchase_return_id: purchaseReturnId,
        debit_account_code: debitEntry?.account?.code,
        credit_account_code: creditEntry?.account?.code,
        created_at: tx.created_at,
      };
    });
  }

  async findAll() {
    const purchaseReturns = await this.returnRepo.find({
      relations: [
        'purchase',
        'supplier',
        'warehouse',
        'items',
        'items.product',
        'items.purchase_item',
        'approved_user',
        'processed_user',
      ],
    });

    // Add refund transactions to each purchase return
    for (const purchaseReturn of purchaseReturns) {
      purchaseReturn['refund_history'] = await this.getRefundTransactions(
        purchaseReturn.id,
      );
    }

    return purchaseReturns;
  }

  async findOne(id: number) {
    const purchaseReturn = await this.returnRepo.findOne({
      where: { id },
      relations: [
        'purchase',
        'supplier',
        'warehouse',
        'items',
        'items.product',
        'items.purchase_item',
        'approved_user',
        'processed_user',
      ],
    });

    if (!purchaseReturn) {
      throw new NotFoundException(`Purchase Return ID ${id} not found`);
    }

    // Add refund transactions to the purchase return
    purchaseReturn['refund_history'] = await this.getRefundTransactions(
      purchaseReturn.id,
    );

    return purchaseReturn;
  }

  async update(id: number, dto: Partial<UpdatePurchaseReturnDto>) {
    const purchaseReturn = await this.returnRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!purchaseReturn) {
      throw new NotFoundException('Purchase Return not found');
    }

    // Only allow updates if status is draft
    if (purchaseReturn.status !== 'draft') {
      throw new BadRequestException('Can only update draft returns');
    }

    // Update main fields
    if (dto.return_no) purchaseReturn.return_no = dto.return_no;
    if (dto.supplier_id) purchaseReturn.supplier_id = dto.supplier_id;
    if (dto.warehouse_id) purchaseReturn.warehouse_id = dto.warehouse_id;
    if (dto.reason !== undefined) purchaseReturn.reason = dto.reason;
    if (dto.status) purchaseReturn.status = dto.status;

    // Handle items update
    if (dto.items) {
      // Remove all old items
      await this.returnItemRepo.delete({ purchase_return: { id } });

      // Calculate new total
      const total = dto.items.reduce((sum, item) => {
        return sum + item.price * item.returned_quantity;
      }, 0);
      purchaseReturn.total = total;

      // Insert fresh items
      const newItems = dto.items.map((i) =>
        this.returnItemRepo.create({
          purchase_return_id: purchaseReturn.id,
          purchase_item_id: i.purchase_item_id,
          product_id: i.product_id,
          returned_quantity: i.returned_quantity,
          price: i.price,
          line_total: i.price * i.returned_quantity,
        }),
      );

      purchaseReturn.items = newItems;
    }

    return await this.returnRepo.save(purchaseReturn);
  }

  async approveReturn(
    id: number,
    dto: ApprovePurchaseReturnDto,
    userId?: number,
  ) {
    const purchaseReturn = await this.findOne(id);

    // Validate status transition
    if (
      !isStatusTransitionValid(
        purchaseReturn.status,
        PurchaseReturnStatus.APPROVED,
      )
    ) {
      throw new BadRequestException(
        `Cannot approve return with status: ${purchaseReturn.status}. Only draft returns can be approved.`,
      );
    }

    // Update purchase return with approval details
    await this.returnRepo.update(id, {
      status: PurchaseReturnStatus.APPROVED,
      approved_at: new Date(),
      approved_by: userId,
      approval_notes: dto.approval_notes,
    });

    return this.findOne(id);
  }

  async processReturn(
    id: number,
    dto: ProcessPurchaseReturnDto,
    userId?: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const purchaseReturn = await manager
        .getRepository(PurchaseReturn)
        .findOne({
          where: { id },
          relations: [
            'items',
            'supplier',
            'supplier.account',
            'warehouse',
            'purchase',
            'approved_user',
            'processed_user',
          ],
        });

      if (!purchaseReturn) {
        throw new NotFoundException('Purchase Return not found');
      }

      // Validate status transition
      if (
        !isStatusTransitionValid(
          purchaseReturn.status,
          PurchaseReturnStatus.PROCESSED,
        )
      ) {
        throw new BadRequestException(
          `Cannot process return with status: ${purchaseReturn.status}. Only approved returns can be processed.`,
        );
      }

      // Must have supplier account
      if (!purchaseReturn.supplier?.account) {
        throw new BadRequestException(
          `Supplier "${purchaseReturn.supplier?.name ?? ''}" has no chart of account assigned.`,
        );
      }

      // Ensure Inventory account exists
      let inventoryAcc = await manager.getRepository(Account).findOne({
        where: { code: 'ASSET.INVENTORY' },
      });

      if (!inventoryAcc) {
        inventoryAcc = await manager.getRepository(Account).save({
          code: 'ASSET.INVENTORY',
          name: 'Inventory Stock',
          type: 'asset',
          account_number: '1010',
        });
      }

      // Update inventory for each returned item
      for (const returnItem of purchaseReturn.items) {
        const existingInventory = await manager
          .getRepository(Inventory)
          .findOne({
            where: {
              product_id: returnItem.product_id,
              warehouse_id: purchaseReturn.warehouse_id,
            },
          });

        if (
          existingInventory &&
          existingInventory.quantity >= returnItem.returned_quantity
        ) {
          // Reduce inventory quantity
          existingInventory.quantity -= returnItem.returned_quantity;
          await manager.getRepository(Inventory).save(existingInventory);

          // Create stock movement entry for return
          await manager.getRepository(StockMovement).save({
            product_id: returnItem.product_id,
            warehouse_id: purchaseReturn.warehouse_id,
            quantity: returnItem.returned_quantity,
            type: StockMovementType.OUT,
            note: `Stock returned to supplier - Purchase Return ${purchaseReturn.return_no}`,
            created_by: userId ? { id: userId } as any : undefined,
          });
        } else {
          throw new BadRequestException(
            `Insufficient inventory for product ID ${returnItem.product_id}. ` +
              `Available: ${existingInventory?.quantity || 0}, Required: ${returnItem.returned_quantity}`,
          );
        }
      }

      // Prepare refund data
      const refundData: any = {
        status: PurchaseReturnStatus.PROCESSED,
        processed_at: new Date(),
        processed_by: userId,
      };

      // Handle money refund settings
      if (dto.refund_to_supplier && !dto.refund_later) {
        // Process immediate refund
        const refundAmount = dto.refund_amount || purchaseReturn.total;

        if (refundAmount > purchaseReturn.total) {
          throw new BadRequestException(
            `Refund amount ${refundAmount} cannot exceed purchase return total ${purchaseReturn.total}`,
          );
        }

        // Update refund data
        refundData.refund_to_supplier = true;
        refundData.refund_amount = refundAmount;
        refundData.refund_payment_method = dto.refund_payment_method;
        refundData.refund_reference = dto.refund_reference;
        refundData.debit_account_code = dto.debit_account_code || 'ASSET.CASH';
        refundData.refunded_at = new Date();

        // Get debit account (use specified account or default to cash)
        const debitAccountCode = dto.debit_account_code || 'ASSET.CASH';
        let debitAcc = await manager.getRepository(Account).findOne({
          where: { code: debitAccountCode },
        });

        if (!debitAcc) {
          throw new BadRequestException(
            `Debit account with code "${debitAccountCode}" not found. Please select a valid account.`,
          );
        }

        // Validate debit account is an asset type
        if (debitAcc.type !== 'asset') {
          throw new BadRequestException(
            `Debit account must be an asset type account. Selected account "${debitAcc.code}" is of type "${debitAcc.type}".`,
          );
        }

        // Create additional accounting entry for money refund to supplier
        await this.accountService.createTransaction(
          'supplier_refund',
          purchaseReturn.id,
          [
            {
              account_code: purchaseReturn.supplier.account.code,
              debit: 0,
              credit: Number(refundAmount),
              narration: `Money refund to supplier for Purchase Return #${purchaseReturn.id}`,
            },
            {
              account_code: debitAcc.code,
              debit: Number(refundAmount),
              credit: 0,
              narration: `${debitAcc.name} outflow for supplier refund - Purchase Return #${purchaseReturn.id}`,
            },
          ],
        );
      } else if (dto.refund_later) {
        // Mark for refund later
        refundData.refund_to_supplier = false;
        refundData.processing_notes = dto.processing_notes
          ? `${dto.processing_notes}\n(Refund to be processed later)`
          : 'Refund to be processed later';
      } else {
        refundData.refund_to_supplier = false;
      }

      // Update purchase return status with processing details
      await manager.update(PurchaseReturn, id, refundData);

      // Post accounting entry (reverse of purchase)
      await this.accountService.createTransaction(
        'purchase_return',
        purchaseReturn.id,
        [
          {
            account_code: purchaseReturn.supplier.account.code,
            debit: Number(purchaseReturn.total),
            credit: 0,
            narration: `Supplier payable reduction for Purchase Return #${purchaseReturn.id}`,
          },
          {
            account_code: 'ASSET.INVENTORY',
            debit: 0,
            credit: Number(purchaseReturn.total),
            narration: `Inventory reduction for Purchase Return #${purchaseReturn.id}`,
          },
        ],
      );

      const response: any = {
        message:
          'Purchase return successfully processed and inventory updated.',
        return_id: purchaseReturn.id,
        total_amount: purchaseReturn.total,
        supplier_account: purchaseReturn.supplier.account.code,
        inventory_account: 'ASSET.INVENTORY',
      };

      // Add refund information
      if (dto.refund_later) {
        response.refund_processed = false;
        response.refund_later = true;
        response.message += ' Refund to be processed later.';
      } else if (dto.refund_to_supplier) {
        response.refund_processed = true;
        response.refund_later = false;
        response.refund_amount = dto.refund_amount || purchaseReturn.total;
        response.refund_payment_method = dto.refund_payment_method;
        response.refund_reference = dto.refund_reference;
        response.debit_account_code = dto.debit_account_code || 'ASSET.CASH';
        response.message += ` Money refund of ${response.refund_amount} processed from ${response.debit_account_code}.`;
      } else {
        response.refund_processed = false;
        response.refund_later = false;
        response.message += ' No money refund processed.';
      }

      return response;
    });
  }

  async cancelReturn(id: number, userId?: number) {
    const purchaseReturn = await this.findOne(id);

    // Validate status transition
    if (
      !isStatusTransitionValid(
        purchaseReturn.status,
        PurchaseReturnStatus.CANCELLED,
      )
    ) {
      throw new BadRequestException(
        `Cannot cancel return with status: ${purchaseReturn.status}. Only draft or approved returns can be cancelled.`,
      );
    }

    await this.returnRepo.update(id, {
      status: PurchaseReturnStatus.CANCELLED,
    });

    return this.findOne(id);
  }

  async processRefund(
    id: number,
    dto: RefundPurchaseReturnDto,
    userId?: number,
  ) {
    const purchaseReturn = await this.findOne(id);

    // Check if return is processed and not already refunded
    if (purchaseReturn.status !== PurchaseReturnStatus.PROCESSED) {
      throw new BadRequestException(
        `Can only process refund for processed purchase returns. Current status: ${purchaseReturn.status}`,
      );
    }

    // Check if already refunded
    if (purchaseReturn.refund_to_supplier) {
      throw new BadRequestException(
        `Refund already processed for Purchase Return #${purchaseReturn.id}`,
      );
    }

    const refundAmount = dto.refund_amount || purchaseReturn.total;

    if (refundAmount > purchaseReturn.total) {
      throw new BadRequestException(
        `Refund amount ${refundAmount} cannot exceed purchase return total ${purchaseReturn.total}`,
      );
    }

    // Validate debit account
    const debitAccountCode = dto.debit_account_code || 'ASSET.CASH';
    const debitAcc =
      await this.accountService.findAccountByCode(debitAccountCode);

    if (!debitAcc) {
      throw new BadRequestException(
        `Debit account with code "${debitAccountCode}" not found. Please select a valid account.`,
      );
    }

    if (debitAcc.type !== 'asset') {
      throw new BadRequestException(
        `Debit account must be an asset type account. Selected account "${debitAcc.code}" is of type "${debitAcc.type}".`,
      );
    }

    // Update purchase return with refund details
    await this.returnRepo.update(id, {
      refund_to_supplier: true,
      refund_amount: refundAmount,
      refund_payment_method: dto.payment_method,
      refund_reference: dto.refund_reference,
      debit_account_code: debitAccountCode,
      refunded_at: new Date(),
      processing_notes: purchaseReturn.processing_notes
        ? `${purchaseReturn.processing_notes}\n${dto.refund_notes || 'Refund processed later'}`
        : dto.refund_notes || 'Refund processed later',
    });

    // Create accounting entry for refund
    await this.accountService.createTransaction(
      'supplier_refund',
      purchaseReturn.id,
      [
        {
          account_code: purchaseReturn.supplier.account.code,
          debit: 0,
          credit: Number(refundAmount),
          narration: `Money refund to supplier for Purchase Return #${purchaseReturn.id}`,
        },
        {
          account_code: debitAcc.code,
          debit: Number(refundAmount),
          credit: 0,
          narration: `${debitAcc.name} outflow for supplier refund - Purchase Return #${purchaseReturn.id}`,
        },
      ],
    );

    return {
      message: `Refund of ${refundAmount} successfully processed from ${debitAcc.name}`,
      return_id: purchaseReturn.id,
      refund_amount: refundAmount,
      debit_account: debitAcc.code,
      supplier_account: purchaseReturn.supplier.account.code,
      payment_method: dto.payment_method,
      reference: dto.refund_reference,
    };
  }

  private async generateReturnNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();

    // Get the count of existing purchase returns for this year
    const currentYearStart = new Date(year, 0, 1); // January 1st of current year
    const nextYearStart = new Date(year + 1, 0, 1); // January 1st of next year

    const count = await this.returnRepo.count({
      where: {
        created_at: Between(currentYearStart, nextYearStart),
      },
    });

    // Add 1 to count and pad with 3 digits
    const nextNumber = (count + 1).toString().padStart(3, '0');
    return `PR-${year}-${nextNumber}`;
  }
}

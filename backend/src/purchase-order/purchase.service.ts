import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { StockMovement, StockMovementType } from 'src/inventory/entities/stock-movement.entity';
import { Product } from 'src/product/entities/product.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Purchase } from './entities/purchase.entity';
import {
  isPurchaseOrderStatusTransitionValid,
  PurchaseOrderStatus,
} from './enums/purchase-order-status.enum';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepo: Repository<PurchaseItem>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepo: Repository<StockMovement>,
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
  ) {}

  async create(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    userId?: number,
  ): Promise<Purchase> {
    return await this.dataSource.transaction(async (manager) => {
      // Generate PO number if not provided
      if (!createPurchaseOrderDto.po_no) {
        const lastPurchase = await manager
          .createQueryBuilder(Purchase, 'p')
          .orderBy('p.id', 'DESC')
          .getOne();

        const year = new Date().getFullYear();
        let nextNumber = 1;

        if (lastPurchase?.po_no) {
          const match = lastPurchase.po_no.match(/PO-(\d{4})-(\d+)/);
          if (match) {
            const poYear = parseInt(match[1]);
            const poNumber = parseInt(match[2]);
            if (poYear === year) {
              nextNumber = poNumber + 1;
            }
          }
        }

        createPurchaseOrderDto.po_no = `PO-${year}-${nextNumber.toString().padStart(3, '0')}`;
      }

      // Validate supplier exists
      const supplier = await manager.findOne(Supplier, {
        where: { id: createPurchaseOrderDto.supplier_id },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with ID ${createPurchaseOrderDto.supplier_id} not found`,
        );
      }

      // Validate warehouse exists
      const warehouse = await manager.findOne(Warehouse, {
        where: { id: createPurchaseOrderDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException(
          `Warehouse with ID ${createPurchaseOrderDto.warehouse_id} not found`,
        );
      }

      // Validate products and calculate totals
      let subtotal = 0;
      let taxAmount = 0;

      const items = await Promise.all(
        createPurchaseOrderDto.items.map(async (itemDto) => {
          const product = await manager.findOne(Product, {
            where: { id: itemDto.product_id },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${itemDto.product_id} not found`,
            );
          }

          const unitPrice = itemDto.unit_price || 0;
          const itemTotal = itemDto.quantity * unitPrice;
          const itemDiscount = itemDto.discount_per_unit * itemDto.quantity;
          const itemTaxable = itemTotal - itemDiscount;
          const itemTax = (itemTaxable * (itemDto.tax_rate || 0)) / 100;
          const itemFinalTotal = itemTaxable + itemTax;

          subtotal += itemTaxable;
          taxAmount += itemTax;

          const purchaseItem = manager.create(PurchaseItem);
          purchaseItem.product_id = itemDto.product_id;
          purchaseItem.quantity = itemDto.quantity;
          purchaseItem.unit_price = unitPrice;
          purchaseItem.price = unitPrice; // Backward compatibility - ensure not null
          purchaseItem.discount_per_unit = itemDto.discount_per_unit ?? 0;
          purchaseItem.tax_rate = itemDto.tax_rate ?? 0;
          purchaseItem.total_price = itemFinalTotal;
          purchaseItem.quantity_received = 0;
          return purchaseItem;
        }),
      );

      const discountAmount = createPurchaseOrderDto.discount_amount || 0;
      const paidAmount = createPurchaseOrderDto.paid_amount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const purchase = manager.create(Purchase, {
        ...createPurchaseOrderDto,
        subtotal,
        tax_amount: createPurchaseOrderDto.tax_amount || taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        total: totalAmount, // Backward compatibility
        paid_amount: paidAmount,
        due_amount: totalAmount - paidAmount,
        created_by_id: userId,
        items,
      });

      const savedPurchase = await manager.save(purchase);

      // Update relationships
      savedPurchase.supplier = supplier;
      savedPurchase.warehouse = warehouse;

      this.logger.log(`Purchase created: ${savedPurchase.po_no}`);
      return savedPurchase;
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: PurchaseOrderStatus,
    supplierId?: number,
  ): Promise<{ purchases: Purchase[]; total: number }> {
    const queryBuilder = this.purchaseRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.supplier', 'supplier')
      .leftJoinAndSelect('p.warehouse', 'warehouse')
      .leftJoinAndSelect('p.created_by', 'created_by')
      .leftJoinAndSelect('p.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('p.is_active = :isActive', { isActive: true });

    if (status) {
      queryBuilder.andWhere('p.status = :status', { status });
    }

    if (supplierId) {
      queryBuilder.andWhere('p.supplier_id = :supplierId', { supplierId });
    }

    const [purchases, total] = await queryBuilder
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { purchases, total };
  }

  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.supplier', 'supplier')
      .leftJoinAndSelect('p.warehouse', 'warehouse')
      .leftJoinAndSelect('p.created_by', 'created_by')
      .leftJoinAndSelect('p.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('p.payment_history', 'payments')
      .where('p.id = :id AND p.is_active = :isActive', { id, isActive: true })
      .getOne();

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async update(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    // Only allow updates for draft status
    if (purchase.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchases can be updated');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Update items if provided
      if (updatePurchaseOrderDto.items) {
        // Remove existing items
        await manager.delete(PurchaseItem, { purchase_id: id });

        // Create new items with explicit ID clearing to ensure new records
        const items = await Promise.all(
          updatePurchaseOrderDto.items.map(async (itemDto) => {
            const product = await manager.findOne(Product, {
              where: { id: itemDto.product_id },
            });
            if (!product) {
              throw new NotFoundException(
                `Product with ID ${itemDto.product_id} not found`,
              );
            }

            const itemTotal = itemDto.quantity * itemDto.unit_price;
            const itemDiscount = itemDto.discount_per_unit * itemDto.quantity;
            const itemTaxable = itemTotal - itemDiscount;
            const itemTax = (itemTaxable * (itemDto.tax_rate || 0)) / 100;
            const itemFinalTotal = itemTaxable + itemTax;

            const purchaseItem = manager.create(PurchaseItem);
            // Ensure it's treated as a new entity by clearing the ID
            purchaseItem.id = undefined;
            purchaseItem.purchase_id = id;
            purchaseItem.product_id = itemDto.product_id;
            purchaseItem.quantity = itemDto.quantity;
            purchaseItem.unit_price = itemDto.unit_price;
            purchaseItem.price = itemDto.unit_price; // Backward compatibility - ensure not null
            purchaseItem.discount_per_unit = itemDto.discount_per_unit ?? 0;
            purchaseItem.tax_rate = itemDto.tax_rate ?? 0;
            purchaseItem.total_price = itemFinalTotal;
            purchaseItem.quantity_received = 0;
            return purchaseItem;
          }),
        );

        // Calculate new totals
        const subtotal = items.reduce(
          (sum, item) =>
            sum + (item.total_price - item.discount_per_unit * item.quantity),
          0,
        );
        const taxAmount = items.reduce((sum, item) => {
          const taxable =
            item.quantity * item.unit_price -
            item.discount_per_unit * item.quantity;
          return sum + (taxable * (item.tax_rate || 0)) / 100;
        }, 0);

        purchase.subtotal = subtotal;
        purchase.tax_amount = updatePurchaseOrderDto.tax_amount || taxAmount;
        const totalAmount =
          subtotal +
          purchase.tax_amount -
          (updatePurchaseOrderDto.discount_amount || 0);
        purchase.total_amount = totalAmount;
        purchase.total = totalAmount; // Backward compatibility
        purchase.due_amount = totalAmount - purchase.paid_amount;

        // Use insert instead of save to force INSERT operations
        await manager.insert(PurchaseItem, items);
      }

      Object.assign(purchase, updatePurchaseOrderDto);
      await manager.save(purchase);

      // Return the purchase with all relationships loaded using the transaction manager
      return await manager
        .createQueryBuilder(Purchase, 'p')
        .leftJoinAndSelect('p.supplier', 'supplier')
        .leftJoinAndSelect('p.warehouse', 'warehouse')
        .leftJoinAndSelect('p.created_by', 'created_by')
        .leftJoinAndSelect('p.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('p.payment_history', 'payments')
        .where('p.id = :id AND p.is_active = :isActive', { id, isActive: true })
        .getOne();
    });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdatePurchaseOrderStatusDto,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    // Validate status transition
    if (
      !isPurchaseOrderStatusTransitionValid(
        purchase.status,
        updateStatusDto.status,
      )
    ) {
      throw new BadRequestException(
        `Cannot transition from ${purchase.status} to ${updateStatusDto.status}`,
      );
    }

    const now = new Date();
    purchase.status = updateStatusDto.status;

    // Update relevant dates
    switch (updateStatusDto.status) {
      case PurchaseOrderStatus.SENT:
        purchase.sent_date = now;
        break;
      case PurchaseOrderStatus.APPROVED:
        purchase.approved_date = now;
        break;
      case PurchaseOrderStatus.PARTIAL_RECEIVED:
      case PurchaseOrderStatus.FULLY_RECEIVED:
        purchase.received_date = now;
        break;
    }

    // Add reason to metadata
    if (updateStatusDto.reason) {
      purchase.metadata = {
        ...purchase.metadata,
        status_change_reason: updateStatusDto.reason,
        status_changed_at: now,
      };
    }

    await this.purchaseRepo.save(purchase);

    this.logger.log(
      `Purchase ${purchase.po_no} status updated to ${updateStatusDto.status}`,
    );
    return purchase;
  }

  async receiveItems(
    id: number,
    receiveItemsDto: ReceiveItemsDto,
    userId?: number,
  ): Promise<Purchase> {
    return await this.dataSource.transaction(async (manager) => {
      const purchase = await manager.findOne(Purchase, {
        where: { id, is_active: true },
        relations: ['items', 'items.product', 'supplier'],
      });

      if (!purchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      if (
        purchase.status !== PurchaseOrderStatus.APPROVED &&
        purchase.status !== PurchaseOrderStatus.PARTIAL_RECEIVED
      ) {
        throw new BadRequestException(
          'Only approved purchases can receive items',
        );
      }

      let allItemsReceived = true;
      let totalValueReceived = 0;

      for (const receiveItem of receiveItemsDto.items) {
        const item = purchase.items.find((i) => i.id === receiveItem.item_id);
        if (!item) {
          throw new NotFoundException(
            `Item with ID ${receiveItem.item_id} not found in purchase`,
          );
        }

        const newQuantityReceived =
          item.quantity_received + receiveItem.quantity;
        if (newQuantityReceived > item.quantity) {
          throw new BadRequestException(
            `Cannot receive more than ordered quantity for item ${item.product.name}`,
          );
        }

        const itemValue = receiveItem.quantity * item.unit_price;
        totalValueReceived += itemValue;

        item.quantity_received = newQuantityReceived;

        if (newQuantityReceived < item.quantity) {
          allItemsReceived = false;
        }

        // Update inventory here
        const existingInventory = await manager.findOne(Inventory, {
          where: {
            product_id: item.product_id,
            warehouse_id: purchase.warehouse_id,
          },
        });

        if (existingInventory) {
          // Update existing inventory batch
          existingInventory.quantity += receiveItem.quantity;
          existingInventory.purchase_price = item.unit_price; // Update price to latest purchase
          await manager.save(existingInventory);
        } else {
          // Generate batch number
          const batchNo = await this.generateBatchNumber(
            manager,
            item.product_id,
            purchase.warehouse_id,
          );

          // Create new inventory batch
          const newInventory = manager.create(Inventory, {
            product_id: item.product_id,
            warehouse_id: purchase.warehouse_id,
            quantity: receiveItem.quantity,
            purchase_price: item.unit_price,
            supplier: purchase.supplier?.name,
            purchase_item_id: item.id,
            batch_no: batchNo,
          });
          await manager.save(newInventory);
        }

        // Create stock movement entry
        await manager.save(StockMovement, {
          product_id: item.product_id,
          warehouse_id: purchase.warehouse_id,
          quantity: receiveItem.quantity,
          type: StockMovementType.IN,
          note: `Stock received from Purchase Order ${purchase.po_no}`,
          created_by: userId ? { id: userId } as any : undefined,
        });

        this.logger.log(
          `Inventory updated: ${receiveItem.quantity} units of ${item.product.name} added to warehouse ${purchase.warehouse_id} for PO ${purchase.po_no}`,
        );
      }

      // Update purchase status
      if (allItemsReceived) {
        purchase.status = PurchaseOrderStatus.FULLY_RECEIVED;
      } else {
        purchase.status = PurchaseOrderStatus.PARTIAL_RECEIVED;
      }

      purchase.received_date = new Date();

      await manager.save(purchase.items);
      await manager.save(purchase);

      // Create accounting entries for received items
      // Debit Inventory, Credit Accounts Payable (Supplier)
      if (totalValueReceived > 0) {
        // Get or create supplier's account
        const supplierAccount =
          await this.accountService.getOrCreateSupplierAccount(
            purchase.supplier_id,
            purchase.supplier?.name || `Supplier ${purchase.supplier_id}`,
          );
        const supplierAccountCode = supplierAccount.code;

        // Create accounting entries for the inventory received
        await this.accountService.createTransaction(
          'purchase_receive',
          purchase.id,
          [
            {
              account_code: 'ASSET.INVENTORY', // Debit Inventory
              debit: totalValueReceived,
              credit: 0,
              narration: `Inventory received for PO ${purchase.po_no}`,
            },
            {
              account_code: supplierAccountCode, // Credit Accounts Payable
              debit: 0,
              credit: totalValueReceived,
              narration: `Accounts payable for ${purchase.po_no}`,
            },
          ],
        );

        // If the purchase was already paid, create payment entries
        if (purchase.paid_amount > 0) {
          // Calculate the portion of payment related to this receipt
          const paymentRatio = totalValueReceived / purchase.total_amount;
          const paymentAmount = purchase.paid_amount * paymentRatio;

          // Create payment accounting entries
          await this.accountService.createTransaction(
            'purchase_payment',
            purchase.id,
            [
              {
                account_code: supplierAccountCode, // Debit Accounts Payable (reduce liability)
                debit: paymentAmount,
                credit: 0,
                narration: `Payment to supplier for PO ${purchase.po_no}`,
              },
              {
                account_code: 'ASSET.CASH', // Credit Cash (reduce cash)
                debit: 0,
                credit: paymentAmount,
                narration: `Cash paid for PO ${purchase.po_no}`,
              },
            ],
          );
        }
      }

      return purchase;
    });
  }

  async receivePurchase(id: number): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (purchase.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('Only approved purchases can be received');
    }

    // Create a receive items DTO with all items to receive full quantity
    const receiveItemsDto: ReceiveItemsDto = {
      items: purchase.items.map((item) => ({
        item_id: item.id,
        quantity: item.quantity - item.quantity_received, // Receive remaining quantity
      })),
    };

    // Call receiveItems to handle the actual receiving and inventory update
    return this.receiveItems(id, receiveItemsDto);
  }

  private async generateBatchNumber(
    manager: any,
    productId: number,
    warehouseId: number,
  ): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Get the next batch number for this product/warehouse/date combination
    const lastBatch = await manager
      .createQueryBuilder(Inventory, 'inv')
      .where('inv.batch_no LIKE :prefix', {
        prefix: `BATCH-${productId}-${warehouseId}-${year}${month}${day}-%`,
      })
      .orderBy('inv.batch_no', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastBatch?.batch_no) {
      const parts = lastBatch.batch_no.split('-');
      const sequenceNumber = parseInt(parts[parts.length - 1]) || 0;
      nextNumber = sequenceNumber + 1;
    }

    return `BATCH-${productId}-${warehouseId}-${year}${month}${day}-${nextNumber.toString().padStart(3, '0')}`;
  }

  async remove(id: number): Promise<void> {
    const purchase = await this.findOne(id);

    if (purchase.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchases can be deleted');
    }

    purchase.is_active = false;
    await this.purchaseRepo.save(purchase);

    this.logger.log(`Purchase ${purchase.po_no} deleted`);
  }
}

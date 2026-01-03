import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { Branch } from 'src/branch/entities/branch.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import {
  StockMovement,
  StockMovementType,
} from 'src/inventory/entities/stock-movement.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSaleReturnDto } from './dto/create-sale-return.dto';
import { ProcessSaleReturnDto } from './dto/process-sale-return.dto';
import { UpdateSaleReturnDto } from './dto/update-sale-return.dto';
import { SaleItem } from './entities/sale-item.entity';
import { SaleReturnItem } from './entities/sale-return-item.entity';
import { SaleReturn } from './entities/sale-return.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SaleReturnService {
  // Account codes used in sale return transactions
  private SALES_RETURN_ACCOUNT = 'INCOME.SALES_RETURN';
  private COGS_RETURN_ACCOUNT = 'EXPENSE.COGS_RETURN';
  private INVENTORY_ACCOUNT = 'ASSET.INVENTORY';
  private CASH_ACCOUNT = 'ASSET.CASH';
  private GENERIC_BANK_ACCOUNT = 'ASSET.BANK';

  constructor(
    private dataSource: DataSource,
    @InjectRepository(SaleReturn)
    private saleReturnRepo: Repository<SaleReturn>,
    @InjectRepository(SaleReturnItem)
    private saleReturnItemRepo: Repository<SaleReturnItem>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private accountService: AccountService,
  ) {}

  async create(dto: CreateSaleReturnDto, userId: number) {
    return await this.dataSource.transaction(async (manager) => {
      // Validate sale exists and is completed
      const sale = await manager.findOne(Sale, {
        where: { id: dto.sale_id },
        relations: ['customer', 'items', 'items.product'],
      });
      if (!sale) throw new NotFoundException('Sale not found');
      if (sale.status !== 'completed') {
        throw new BadRequestException(
          'Can only return items from completed sales',
        );
      }

      // Validate customer
      const customer = await manager.findOne(Customer, {
        where: { id: dto.customer_id },
        relations: ['group'],
      });
      if (!customer) throw new NotFoundException('Customer not found');

      // Validate branch and warehouse
      const branch = await manager.findOne(Branch, {
        where: { id: dto.branch_id },
      });
      if (!branch) throw new NotFoundException('Branch not found');

      const warehouse = await manager.findOne(Warehouse, {
        where: { id: dto.warehouse_id },
      });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      // Generate return number if not provided
      const return_no = dto.return_no || (await this.generateReturnNo(manager));

      // Validate items and calculate totals
      const returnItems: SaleReturnItem[] = [];
      let calculatedTotal = 0;
      let calculatedTax = 0;
      let calculatedDiscount = 0;

      for (const item of dto.items) {
        // Validate sale item exists
        const saleItem = await manager.findOne(SaleItem, {
          where: { id: item.sale_item_id },
        });
        if (!saleItem)
          throw new NotFoundException(
            `Sale item ${item.sale_item_id} not found`,
          );

        // Check if sale item belongs to the sale
        if (saleItem.sale?.id !== dto.sale_id) {
          throw new BadRequestException(
            `Sale item ${item.sale_item_id} does not belong to sale ${dto.sale_id}`,
          );
        }

        // Check returnable quantity
        const totalReturnedForItem = await manager
          .createQueryBuilder(SaleReturnItem, 'sri')
          .leftJoin('sri.sale_return', 'sr')
          .leftJoin('sri.sale_item', 'si')
          .where('si.id = :saleItemId', { saleItemId: item.sale_item_id })
          .andWhere('sr.status IN (:...statuses)', {
            statuses: ['approved', 'processed'],
          })
          .select('SUM(sri.returned_quantity)', 'totalReturned')
          .getRawOne()
          .then((result) => parseInt(result?.totalReturned || '0'));

        if (totalReturnedForItem + item.returned_quantity > saleItem.quantity) {
          throw new BadRequestException(
            `Cannot return ${item.returned_quantity} units. Original sale: ${saleItem.quantity}, Already returned: ${totalReturnedForItem}`,
          );
        }

        // Validate product
        const product = await manager.findOne(Product, {
          where: { id: item.product_id },
        });
        if (!product)
          throw new NotFoundException(`Product ${item.product_id} not found`);

        // Calculate line totals (use original sale item values)
        const unitPrice = Number(saleItem.unit_price);
        const lineSubtotal = unitPrice * item.returned_quantity;

        // Calculate item-level tax and discount proportionally
        const lineTotalOriginal = Number(saleItem.line_total);
        const taxRate =
          lineTotalOriginal > 0 ? Number(saleItem.tax) / lineTotalOriginal : 0;
        const discountRate =
          lineTotalOriginal > 0
            ? Number(saleItem.discount) / lineTotalOriginal
            : 0;

        const itemTax = lineSubtotal * taxRate;
        const itemDiscount = lineSubtotal * discountRate;
        const lineTotal = lineSubtotal + itemTax - itemDiscount;

        calculatedTotal += lineTotal;
        calculatedTax += itemTax;
        calculatedDiscount += itemDiscount;

        const returnItem = manager.create(SaleReturnItem, {
          sale_item_id: item.sale_item_id,
          product,
          returned_quantity: item.returned_quantity,
          unit_price: unitPrice,
          discount: itemDiscount,
          tax: itemTax,
          line_total: lineTotal,
          return_reason: item.return_reason,
          item_condition: item.item_condition,
        });
        returnItems.push(returnItem);
      }

      // Create sale return
      const saleReturn = manager.create(SaleReturn, {
        return_no,
        sale,
        customer,
        warehouse,
        branch,
        processed_by: { id: userId } as any,
        reason: dto.reason,
        status: dto.status || 'draft',
        refund_method: dto.refund_method,
        total: calculatedTotal,
        refunded_amount: dto.refunded_amount || 0,
        remaining_amount: calculatedTotal - (dto.refunded_amount || 0),
        refund_notes: dto.refund_notes,
      });

      saleReturn.items = returnItems;
      const savedReturn = await manager.save(SaleReturn, saleReturn);

      return manager.findOne(SaleReturn, {
        where: { id: savedReturn.id },
        relations: [
          'sale',
          'customer',
          'warehouse',
          'branch',
          'items',
          'items.product',
          'processed_by',
        ],
      });
    });
  }

  async findAll() {
    return this.saleReturnRepo.find({
      relations: [
        'sale',
        'customer',
        'warehouse',
        'branch',
        'items',
        'items.product',
        'processed_by',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const saleReturn = await this.saleReturnRepo.findOne({
      where: { id },
      relations: [
        'sale',
        'customer',
        'warehouse',
        'branch',
        'items',
        'items.product',
        'items.sale_item',
        'processed_by',
      ],
    });

    if (!saleReturn) throw new NotFoundException('Sale return not found');
    return saleReturn;
  }

  async update(id: number, dto: UpdateSaleReturnDto) {
    const saleReturn = await this.saleReturnRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!saleReturn) throw new NotFoundException('Sale return not found');

    // Only allow updates if status is draft
    if (saleReturn.status !== 'draft') {
      throw new BadRequestException('Can only update draft returns');
    }

    // Update main fields
    Object.assign(saleReturn, dto);

    // Handle items update
    if (dto.items) {
      // Remove all old items
      await this.saleReturnItemRepo.delete({ sale_return: { id } });

      // Recalculate totals with proper tax and discount calculation
      let total = 0;
      const itemsToCreate = [];
      for (const updateItem of dto.items) {
        const saleItem = await this.saleItemRepo.findOne({
          where: { id: updateItem.sale_item_id },
          relations: ['product'],
        });

        if (saleItem) {
          const unitPrice = Number(saleItem.unit_price);
          const lineSubtotal = unitPrice * updateItem.returned_quantity;

          // Calculate tax and discount proportionally
          const lineTotalOriginal = Number(saleItem.line_total);
          const taxRate =
            lineTotalOriginal > 0
              ? Number(saleItem.tax) / lineTotalOriginal
              : 0;
          const discountRate =
            lineTotalOriginal > 0
              ? Number(saleItem.discount) / lineTotalOriginal
              : 0;

          const itemTax = lineSubtotal * taxRate;
          const itemDiscount = lineSubtotal * discountRate;
          const lineTotal = lineSubtotal + itemTax - itemDiscount;

          total += lineTotal;

          itemsToCreate.push({
            saleItem,
            unitPrice,
            itemTax,
            itemDiscount,
            lineTotal,
          });
        }
      }
      saleReturn.total = total;
      saleReturn.remaining_amount = total - (saleReturn.refunded_amount || 0);

      // Insert fresh items
      const newItems = [];
      for (const updateItem of dto.items) {
        const saleItem = await this.saleItemRepo.findOne({
          where: { id: updateItem.sale_item_id },
          relations: ['product'],
        });

        if (saleItem) {
          const unitPrice = Number(saleItem.unit_price);
          const lineSubtotal = unitPrice * updateItem.returned_quantity;

          // Calculate tax and discount proportionally
          const lineTotalOriginal = Number(saleItem.line_total);
          const taxRate =
            lineTotalOriginal > 0
              ? Number(saleItem.tax) / lineTotalOriginal
              : 0;
          const discountRate =
            lineTotalOriginal > 0
              ? Number(saleItem.discount) / lineTotalOriginal
              : 0;

          const itemTax = lineSubtotal * taxRate;
          const itemDiscount = lineSubtotal * discountRate;
          const lineTotal = lineSubtotal + itemTax - itemDiscount;

          const returnItem = this.saleReturnItemRepo.create({
            sale_return_id: saleReturn.id,
            sale_item_id: updateItem.sale_item_id,
            product_id: updateItem.product_id,
            returned_quantity: updateItem.returned_quantity,
            unit_price: unitPrice,
            discount: itemDiscount,
            tax: itemTax,
            line_total: lineTotal,
            return_reason: updateItem.return_reason,
            item_condition: updateItem.item_condition,
          });
          newItems.push(returnItem);
        }
      }

      saleReturn.items = newItems;
    }

    return await this.saleReturnRepo.save(saleReturn);
  }

  async approveReturn(id: number) {
    const saleReturn = await this.saleReturnRepo.findOne({
      where: { id },
      relations: ['sale'],
    });

    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (saleReturn.status !== 'draft') {
      throw new BadRequestException('Can only approve draft returns');
    }

    saleReturn.status = 'approved';
    return await this.saleReturnRepo.save(saleReturn);
  }

  async processReturn(id: number, dto: ProcessSaleReturnDto, userId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const saleReturn = await manager.getRepository(SaleReturn).findOne({
        where: { id },
        relations: [
          'sale',
          'customer',
          'warehouse',
          'branch',
          'items',
          'items.product',
          'items.sale_item',
          'items.sale_item.product',
        ],
      });

      if (!saleReturn) throw new NotFoundException('Sale return not found');
      if (saleReturn.status !== 'approved') {
        throw new BadRequestException('Can only process approved returns');
      }

      // Validate refund amount
      if (dto.refund_amount > saleReturn.remaining_amount) {
        throw new BadRequestException(
          `Refund amount cannot exceed remaining amount of ${saleReturn.remaining_amount}`,
        );
      }

      // Update inventory and create stock movements
      for (const returnItem of saleReturn.items) {
        // Find inventory to restore
        const inventory = await manager.getRepository(Inventory).findOne({
          where: {
            product_id: returnItem.product.id,
            warehouse_id: saleReturn.warehouse.id,
          },
        });

        if (!inventory) {
          throw new BadRequestException(
            `No inventory found for product ${returnItem.product.name} in warehouse ${saleReturn.warehouse.id}`,
          );
        }

        // Restore sold_quantity (decrement it)
        inventory.sold_quantity =
          Number(inventory.sold_quantity || 0) - returnItem.returned_quantity;
        await manager.save(inventory);

        // Create reverse stock movement
        await manager.save(StockMovement, {
          product_id: returnItem.product.id,
          warehouse_id: saleReturn.warehouse.id,
          quantity: returnItem.returned_quantity,
          type: StockMovementType.IN, // IN indicates return to stock
          note: `Sale return ${saleReturn.return_no}`,
          reference_id: saleReturn.id,
        });
      }

      // Create accounting entries
      await this.createReturnAccounting(manager, saleReturn, dto);

      // Update sale return
      saleReturn.refunded_amount =
        Number(saleReturn.refunded_amount || 0) + dto.refund_amount;
      saleReturn.remaining_amount =
        Number(saleReturn.total) - Number(saleReturn.refunded_amount);
      saleReturn.refund_method = dto.refund_method;
      saleReturn.refund_notes = saleReturn.refund_notes
        ? `${saleReturn.refund_notes}\n${dto.notes || ''}`
        : dto.notes;
      saleReturn.status =
        saleReturn.remaining_amount <= 0 ? 'processed' : 'approved';

      const processedBy = { id: userId } as any;
      if (processedBy) {
        saleReturn.processed_by = processedBy;
      }

      await manager.save(saleReturn);

      // Update original sale status
      await this.updateOriginalSaleStatus(manager, saleReturn);

      return {
        message: 'Sale return processed successfully',
        return_id: saleReturn.id,
        refund_amount: dto.refund_amount,
        remaining_amount: saleReturn.remaining_amount,
        status: saleReturn.status,
      };
    });
  }

  async cancelReturn(id: number) {
    const saleReturn = await this.saleReturnRepo.findOne({
      where: { id },
    });

    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (saleReturn.status === 'processed') {
      throw new BadRequestException('Cannot cancel processed returns');
    }

    saleReturn.status = 'cancelled';
    return await this.saleReturnRepo.save(saleReturn);
  }

  async remove(id: number) {
    const saleReturn = await this.saleReturnRepo.findOne({ where: { id } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    if (saleReturn.status !== 'draft' && saleReturn.status !== 'cancelled') {
      throw new BadRequestException(
        'Can only delete draft or cancelled returns',
      );
    }

    await this.saleReturnRepo.remove(saleReturn);
    return { message: 'Sale return deleted successfully' };
  }

  private async createReturnAccounting(
    _manager: any,
    saleReturn: SaleReturn,
    dto: ProcessSaleReturnDto,
  ) {
    // Create journal lines for return
    const journalLines = [];

    // 1. Reverse revenue
    journalLines.push({
      account_code: this.SALES_RETURN_ACCOUNT,
      debit: 0,
      credit: dto.refund_amount,
      narration: `Sales return revenue reversal for ${saleReturn.return_no}`,
    });

    // 2. Create refund payment entry
    let refundAccountCode = this.CASH_ACCOUNT;
    if (dto.refund_method === 'bank' || dto.refund_method === 'mobile') {
      refundAccountCode = dto.account_code || this.GENERIC_BANK_ACCOUNT;
    } else if (dto.refund_method === 'store_credit') {
      refundAccountCode = `AR.CUSTOMER.${saleReturn.customer.id}`;
    }

    journalLines.push({
      account_code: refundAccountCode,
      debit: 0,
      credit: dto.refund_amount,
      narration: `Refund payment to customer for ${saleReturn.return_no} (${dto.refund_method})`,
    });

    // 3. Reverse COGS (if applicable)
    const cogsReversalAmount = saleReturn.items.reduce((total, item) => {
      const originalCost = Number(
        item.sale_item?.product?.purchase_price ||
          item.product?.purchase_price ||
          0,
      );
      return total + originalCost * item.returned_quantity;
    }, 0);

    if (cogsReversalAmount > 0 && saleReturn.total > 0) {
      // Calculate proportion of COGS to reverse based on refund amount
      const cogsToReverse =
        (cogsReversalAmount * dto.refund_amount) / Number(saleReturn.total);

      journalLines.push({
        account_code: this.COGS_RETURN_ACCOUNT,
        debit: 0,
        credit: cogsToReverse,
        narration: `COGS reversal for ${saleReturn.return_no}`,
      });

      journalLines.push({
        account_code: this.INVENTORY_ACCOUNT,
        debit: cogsToReverse,
        credit: 0,
        narration: `Inventory restoration for ${saleReturn.return_no}`,
      });
    }

    // Create the transaction
    await this.accountService.createTransaction(
      'sale_return',
      saleReturn.id,
      journalLines,
    );
  }

  private async updateOriginalSaleStatus(manager: any, saleReturn: SaleReturn) {
    const sale = await manager.getRepository(Sale).findOne({
      where: { id: saleReturn.sale.id },
    });

    if (!sale) return;

    // Calculate total refunded amount for this sale
    const totalRefunded = await manager
      .createQueryBuilder(SaleReturn, 'sr')
      .where('sr.sale_id = :saleId', { saleId: sale.id })
      .andWhere('sr.status IN (:...statuses)', {
        statuses: ['approved', 'processed'],
      })
      .select('SUM(sr.refunded_amount)', 'total')
      .getRawOne()
      .then((result) => Number(result?.total || 0));

    // Update sale status based on refund amount
    if (totalRefunded >= sale.total) {
      sale.status = 'refunded';
    } else if (totalRefunded > 0) {
      sale.status = 'partial_refund';
    }

    await manager.save(sale);
  }

  private async generateReturnNo(manager: any): Promise<string> {
    const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const base = `SR-${dateKey}`;

    const last = await manager
      .createQueryBuilder(SaleReturn, 'sr')
      .where('sr.return_no LIKE :pattern', { pattern: `${base}%` })
      .orderBy('sr.id', 'DESC')
      .getOne();

    if (!last) return `${base}-0001`;
    const seg = last.return_no.split('-').pop() || '0';
    const seq = parseInt(seg, 10) || 0;
    return `${base}-${String(seq + 1).padStart(4, '0')}`;
  }
}

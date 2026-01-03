import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditService } from 'src/audit/audit.service';
import {
  AuditAction,
  AuditModule,
} from 'src/audit/entities/audit-trail-simple.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';
import { SaleItem } from 'src/sales/entities/sale-item.entity';
import { SalePayment } from 'src/sales/entities/sale-payment.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ConvertToSaleDto } from './dto/convert-to-sale.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationItem } from './entities/quotation-item.entity';
import { Quotation } from './entities/quotation.entity';

@Injectable()
export class QuotationService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Quotation) private quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private quotationItemRepo: Repository<QuotationItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(SalePayment)
    private salePaymentRepo: Repository<SalePayment>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateQuotationDto, userId?: number): Promise<Quotation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate quotation number if not provided
      if (!dto.quotation_no) {
        const currentYear = new Date().getFullYear();
        const yearPrefix = `QN-${currentYear}`;

        // Find the last quotation number for this year
        const lastQuotation = await queryRunner.manager
          .createQueryBuilder(Quotation, 'quotation')
          .where('quotation.quotation_no LIKE :yearPrefix', {
            yearPrefix: `${yearPrefix}-%`,
          })
          .orderBy('quotation.quotation_no', 'DESC')
          .limit(1)
          .getOne();

        let nextNumber = 1;
        if (lastQuotation) {
          // Extract the last number from the existing quotation number
          const lastNumber = parseInt(lastQuotation.quotation_no.split('-')[2]);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }

        dto.quotation_no = `${yearPrefix}-${String(nextNumber).padStart(4, '0')}`;
      }

      // Check for duplicate quotation number
      const existingQuotation = await queryRunner.manager.findOne(Quotation, {
        where: { quotation_no: dto.quotation_no },
      });
      if (existingQuotation) {
        throw new BadRequestException('Quotation number already exists');
      }

      // Validate customer if provided
      let customer = null;
      if (dto.customer_id) {
        customer = await queryRunner.manager.findOne(Customer, {
          where: { id: dto.customer_id },
        });
        if (!customer) {
          throw new BadRequestException('Customer not found');
        }
      }

      // Get user for created_by field
      const createdByUser = userId
        ? await this.userRepo.findOne({ where: { id: userId } })
        : null;

      // Get default warehouse from branch if branch_id is provided
      let defaultWarehouseId = null;
      if (dto.branch_id) {
        const branch = await queryRunner.manager.findOne(Branch, {
          where: { id: dto.branch_id },
          relations: ['default_warehouse'],
        });

        if (!branch) {
          throw new BadRequestException('Branch not found');
        }
        if (!branch.default_warehouse) {
          throw new BadRequestException(
            'Branch does not have a default warehouse configured',
          );
        }
        defaultWarehouseId = branch.default_warehouse.id;
      } else {
        // If no branch is provided, items can still be created but warehouse_id will be null
        // This allows for flexibility in scenarios where warehouse assignment is not critical at quotation stage
      }

      // Create quotation
      const quotation = new Quotation();
      quotation.quotation_no = dto.quotation_no;
      quotation.customer = customer;
      quotation.created_by = createdByUser;
      quotation.branch_id = dto.branch_id;
      quotation.status = dto.status || 'draft';
      quotation.valid_until = dto.valid_until
        ? new Date(dto.valid_until)
        : null;
      quotation.terms_and_conditions = dto.terms_and_conditions;
      quotation.notes = dto.notes;

      // Process quotation items
      const items = [];
      let subtotal = 0;

      for (const itemDto of dto.items) {
        // Validate product
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.product_id },
          relations: ['unit'],
        });
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${itemDto.product_id} not found`,
          );
        }

        const quantity = Number(itemDto.quantity);
        const unitPrice = itemDto.unit_price
          ? Number(itemDto.unit_price)
          : Number(product.selling_price);

        // Calculate item discounts
        let itemDiscount = 0;
        if (itemDto.discount_type && itemDto.discount_value) {
          if (itemDto.discount_type === 'fixed') {
            itemDiscount = Number(itemDto.discount_value);
          } else {
            itemDiscount =
              (unitPrice * quantity * Number(itemDto.discount_value)) / 100;
          }
        }

        // Calculate item tax
        const itemTaxPercentage = itemDto.tax_percentage || 0;
        const discountedPrice = unitPrice * quantity - itemDiscount;
        const itemTax = (discountedPrice * itemTaxPercentage) / 100;

        const totalPrice = unitPrice * quantity;
        const netPrice = discountedPrice + itemTax;

        subtotal += totalPrice;

        const quotationItem = queryRunner.manager.create(QuotationItem, {
          product,
          productId: product.id,
          warehouseId: defaultWarehouseId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          discount_percentage:
            itemDto.discount_type === 'percentage'
              ? Number(itemDto.discount_value) || 0
              : 0,
          discount_amount: itemDiscount,
          tax_percentage: itemTaxPercentage,
          tax_amount: itemTax,
          net_price: netPrice,
          unit: product.unit,
          notes: itemDto.notes,
        });

        items.push(quotationItem);
      }

      // Calculate quotation-level discounts and taxes
      let discount = 0;
      if (dto.discount_type && dto.discount_value) {
        if (dto.discount_type === 'fixed') {
          discount = Number(dto.discount_value);
        } else {
          discount = (subtotal * Number(dto.discount_value)) / 100;
        }
      }

      const afterDiscount = subtotal - discount;
      const tax = dto.tax_percentage
        ? (afterDiscount * dto.tax_percentage) / 100
        : 0;
      const total = afterDiscount + tax;

      // Update quotation with calculated values
      quotation.subtotal = subtotal;
      quotation.discount = discount;
      quotation.manual_discount =
        dto.discount_type === 'fixed' ? Number(dto.discount_value) || 0 : 0;
      quotation.group_discount =
        dto.discount_type === 'percentage'
          ? Number(dto.discount_value) || 0
          : 0;
      quotation.tax = tax;
      quotation.total = total;

      // Save quotation and items
      const savedQuotation = await queryRunner.manager.save(quotation);
      items.forEach((item) => (item.quotation = savedQuotation));
      await queryRunner.manager.save(items);

      await queryRunner.commitTransaction();

      // Audit log
      await this.auditService.log(
        userId,
        createdByUser?.username || null,
        null, // IP - not available in service context
        null, // User agent - not available in service context
        {
          action: AuditAction.CREATE,
          module: AuditModule.SALES,
          entityType: 'Quotation',
          entityId: savedQuotation.id,
          oldValues: null,
          newValues: savedQuotation,
        },
      );

      return this.findOne(savedQuotation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    paginationDto: PaginationDto & { status?: string; customer_id?: number },
  ): Promise<PaginationResponse<Quotation>> {
    const { page = 1, limit = 10, status, customer_id } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.quotationRepo
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.created_by', 'created_by')
      .leftJoinAndSelect('quotation.branch', 'branch')
      .leftJoinAndSelect('quotation.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.unit', 'unit')
      .orderBy('quotation.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('quotation.status = :status', { status });
    }

    if (customer_id) {
      queryBuilder.andWhere('quotation.customer.id = :customer_id', {
        customer_id,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Quotation> {
    const quotation = await this.quotationRepo
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.created_by', 'created_by')
      .leftJoinAndSelect('quotation.branch', 'branch')
      .leftJoinAndSelect('quotation.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.unit', 'unit')
      .where('quotation.id = :id', { id })
      .getOne();

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async update(
    id: number,
    dto: UpdateQuotationDto,
    userId?: number,
  ): Promise<Quotation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingQuotation = await queryRunner.manager.findOne(Quotation, {
        where: { id },
        relations: ['items', 'customer', 'created_by'],
      });

      if (!existingQuotation) {
        throw new NotFoundException('Quotation not found');
      }

      // Don't allow updates if quotation is already accepted, rejected, or converted
      if (
        ['accepted', 'rejected', 'converted'].includes(existingQuotation.status)
      ) {
        throw new BadRequestException(
          'Cannot update quotation in current status',
        );
      }

      // Store old values for audit
      const oldValues = { ...existingQuotation };

      // Update customer if provided
      if (dto.customer_id !== undefined) {
        const customer = dto.customer_id
          ? await queryRunner.manager.findOne(Customer, {
              where: { id: dto.customer_id },
            })
          : null;

        if (dto.customer_id && !customer) {
          throw new BadRequestException('Customer not found');
        }
        existingQuotation.customer = customer;
      }

      // Update other fields
      if (dto.branch_id !== undefined) {
        existingQuotation.branch_id = dto.branch_id;
      }
      if (dto.valid_until !== undefined) {
        existingQuotation.valid_until = dto.valid_until
          ? new Date(dto.valid_until)
          : null;
      }

      // Get default warehouse for items if branch_id is provided or use existing branch
      let defaultWarehouseId = null;
      const branch_idToUse =
        dto.branch_id !== undefined
          ? dto.branch_id
          : existingQuotation.branch_id;
      if (branch_idToUse) {
        const branch = await queryRunner.manager.findOne(Branch, {
          where: { id: branch_idToUse },
          relations: ['default_warehouse'],
        });
        if (!branch) {
          throw new BadRequestException('Branch not found');
        }
        if (!branch.default_warehouse) {
          throw new BadRequestException(
            'Branch does not have a default warehouse configured',
          );
        }
        defaultWarehouseId = branch.default_warehouse.id;
      }
      if (dto.terms_and_conditions !== undefined) {
        existingQuotation.terms_and_conditions = dto.terms_and_conditions;
      }
      if (dto.notes !== undefined) {
        existingQuotation.notes = dto.notes;
      }
      if (dto.status !== undefined) {
        existingQuotation.status = dto.status;
      }

      // Update items if provided
      if (dto.items) {
        // Remove existing items
        await queryRunner.manager.delete(QuotationItem, { quotation: { id } });

        // Process new items
        const items = [];
        let subtotal = 0;

        for (const itemDto of dto.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: itemDto.product_id },
            relations: ['unit'],
          });
          if (!product) {
            throw new BadRequestException(
              `Product with ID ${itemDto.product_id} not found`,
            );
          }

          const quantity = Number(itemDto.quantity);
          const unitPrice = itemDto.unit_price
            ? Number(itemDto.unit_price)
            : Number(product.selling_price);

          // Calculate item discounts
          let itemDiscount = 0;
          if (itemDto.discount_type && itemDto.discount_value) {
            if (itemDto.discount_type === 'fixed') {
              itemDiscount = Number(itemDto.discount_value);
            } else {
              itemDiscount =
                (unitPrice * quantity * Number(itemDto.discount_value)) / 100;
            }
          }

          // Calculate item tax
          const itemTaxPercentage = itemDto.tax_percentage || 0;
          const discountedPrice = unitPrice * quantity - itemDiscount;
          const itemTax = (discountedPrice * itemTaxPercentage) / 100;

          const totalPrice = unitPrice * quantity;
          const netPrice = discountedPrice + itemTax;

          subtotal += totalPrice;

          const quotationItem = queryRunner.manager.create(QuotationItem, {
            quotation: existingQuotation,
            product,
            productId: product.id,
            warehouseId: defaultWarehouseId,
            quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            discount_percentage:
              itemDto.discount_type === 'percentage'
                ? Number(itemDto.discount_value) || 0
                : 0,
            discount_amount: itemDiscount,
            tax_percentage: itemTaxPercentage,
            tax_amount: itemTax,
            net_price: netPrice,
            unit: product.unit,
            notes: itemDto.notes,
          });

          items.push(quotationItem);
        }

        // Calculate quotation-level discounts and taxes
        let discount = 0;
        if (dto.discount_type && dto.discount_value) {
          if (dto.discount_type === 'fixed') {
            discount = Number(dto.discount_value);
          } else {
            discount = (subtotal * Number(dto.discount_value)) / 100;
          }
        }

        const afterDiscount = subtotal - discount;
        const tax = dto.tax_percentage
          ? (afterDiscount * dto.tax_percentage) / 100
          : 0;
        const total = afterDiscount + tax;

        // Update quotation with calculated values
        existingQuotation.subtotal = subtotal;
        existingQuotation.discount = discount;
        existingQuotation.manual_discount =
          dto.discount_type === 'fixed' ? Number(dto.discount_value) || 0 : 0;
        existingQuotation.group_discount =
          dto.discount_type === 'percentage'
            ? Number(dto.discount_value) || 0
            : 0;
        existingQuotation.tax = tax;
        existingQuotation.total = total;

        await queryRunner.manager.save(items);
      }

      const savedQuotation = await queryRunner.manager.save(existingQuotation);

      await queryRunner.commitTransaction();

      // Get username for audit
      const auditUser = userId
        ? await this.userRepo.findOne({ where: { id: userId } })
        : null;

      // Audit log
      await this.auditService.log(
        userId,
        auditUser?.username || null,
        null, // IP - not available in service context
        null, // User agent - not available in service context
        {
          action: AuditAction.UPDATE,
          module: AuditModule.SALES,
          entityType: 'Quotation',
          entityId: savedQuotation.id,
          oldValues,
          newValues: savedQuotation,
        },
      );

      return this.findOne(savedQuotation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(
    id: number,
    dto: UpdateQuotationStatusDto,
    userId?: number,
  ): Promise<Quotation> {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['customer', 'created_by'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    const oldValues = { ...quotation };
    quotation.status = dto.status;

    const updatedQuotation = await this.quotationRepo.save(quotation);

    // Get username for audit
    const auditUser = userId
      ? await this.userRepo.findOne({ where: { id: userId } })
      : null;

    // Audit log
    await this.auditService.log(
      userId,
      auditUser?.username || null,
      null, // IP - not available in service context
      null, // User agent - not available in service context
      {
        action: AuditAction.UPDATE,
        module: AuditModule.SALES,
        entityType: 'Quotation',
        entityId: updatedQuotation.id,
        oldValues,
        newValues: { status: dto.status, reason: dto.reason },
      },
    );

    return this.findOne(updatedQuotation.id);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Don't allow deletion if quotation is accepted or converted
    if (['accepted', 'converted'].includes(quotation.status)) {
      throw new BadRequestException(
        'Cannot delete quotation in current status',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete quotation items first
      await queryRunner.manager.delete(QuotationItem, { quotation: { id } });

      // Delete quotation
      await queryRunner.manager.delete(Quotation, { id });

      await queryRunner.commitTransaction();

      // Get username for audit
      const auditUser = userId
        ? await this.userRepo.findOne({ where: { id: userId } })
        : null;

      // Audit log
      await this.auditService.log(
        userId,
        auditUser?.username || null,
        null, // IP - not available in service context
        null, // User agent - not available in service context
        {
          action: AuditAction.DELETE,
          module: AuditModule.SALES,
          entityType: 'Quotation',
          entityId: id,
          oldValues: quotation,
          newValues: null,
        },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getQuotationsByCustomer(customerId: number): Promise<Quotation[]> {
    return this.quotationRepo.find({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async getExpiredQuotations(): Promise<Quotation[]> {
    const today = new Date();
    return this.quotationRepo.find({
      where: {
        valid_until: { $lt: today } as any,
        status: 'sent',
      },
      relations: ['customer'],
      order: { valid_until: 'ASC' },
    });
  }

  async convertToSale(
    id: number,
    dto: ConvertToSaleDto,
    userId?: number,
  ): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get quotation with all relations
      const quotation = await queryRunner.manager.findOne(Quotation, {
        where: { id },
        relations: [
          'customer',
          'items',
          'items.product',
          'branch',
          'created_by',
        ],
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found');
      }

      // Validate quotation status - can only convert accepted quotations
      if (quotation.status === 'converted') {
        throw new BadRequestException('Quotation is already converted to sale');
      }

      if (quotation.status !== 'accepted') {
        throw new BadRequestException(
          'Can only convert quotations with "accepted" status',
        );
      }

      // Generate invoice number (same format as sales service)
      const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const invoiceBase = `INV-${dateKey}`;

      const lastSale = await queryRunner.manager
        .createQueryBuilder(Sale, 'sale')
        .where('sale.invoice_no LIKE :pattern', {
          pattern: `${invoiceBase}-%`,
        })
        .orderBy('sale.invoice_no', 'DESC')
        .limit(1)
        .getOne();

      let nextNumber = 1;
      if (lastSale) {
        const match = lastSale.invoice_no.match(/INV-\d{8}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const invoiceNo = `${invoiceBase}-${String(nextNumber).padStart(4, '0')}`;

      // Get user for created_by field
      const createdByUser = userId
        ? await this.userRepo.findOne({ where: { id: userId } })
        : null;

      // Determine branch and warehouse for sale
      const branch_id = dto.branch_id || quotation.branch_id;
      let warehouseId = dto.warehouse_id; // Use provided warehouse_id if specified

      if (branch_id) {
        const branch = await queryRunner.manager.findOne(Branch, {
          where: { id: branch_id },
          relations: ['default_warehouse'],
        });
        if (!branch) {
          throw new BadRequestException('Branch not found');
        }
        // If no specific warehouse provided, use branch's default warehouse
        if (!warehouseId) {
          if (!branch.default_warehouse) {
            throw new BadRequestException(
              'Branch does not have a default warehouse configured',
            );
          }
          warehouseId = branch.default_warehouse.id;
        }
      } else {
        throw new BadRequestException('Branch is required for sale conversion');
      }

      // Create sale
      const sale = queryRunner.manager.create(Sale, {
        invoice_no: invoiceNo,
        customer: quotation.customer,
        created_by: createdByUser,
        branch_id: branch_id,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        manual_discount: quotation.manual_discount,
        group_discount: quotation.group_discount,
        tax: quotation.tax,
        total: quotation.total,
        paid_amount: 0,
        sale_type: 'regular',
        status: 'completed',
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Create sale items
      const saleItems = [];
      for (const quotationItem of quotation.items) {
        const saleItem = queryRunner.manager.create(SaleItem, {
          sale: savedSale,
          product: quotationItem.product,
          quantity: Math.round(Number(quotationItem.quantity || 0)),
          warehouse_id: warehouseId,
          unit_price: Number(quotationItem.unit_price || 0),
          discount: Number(quotationItem.discount_amount || 0),
          tax: Number(quotationItem.tax_amount || 0),
          line_total: Number(quotationItem.net_price || 0),
        });
        saleItems.push(saleItem);
      }

      await queryRunner.manager.save(saleItems);

      // Create sale payments
      const salePayments = [];
      let totalPaid = 0;
      for (const payment of dto.payments) {
        const salePayment = queryRunner.manager.create(SalePayment, {
          sale: savedSale,
          method: payment.method,
          amount: payment.amount,
          account_code: payment.account_code,
        });
        salePayments.push(salePayment);
        totalPaid += payment.amount;
      }

      await queryRunner.manager.save(salePayments);

      // Update sale paid amount
      savedSale.paid_amount = totalPaid;
      await queryRunner.manager.save(savedSale);

      // Update quotation status to converted
      quotation.status = 'converted';
      await queryRunner.manager.save(quotation);

      await queryRunner.commitTransaction();

      // Audit log for quotation conversion
      await this.auditService.log(
        userId,
        createdByUser?.username || null,
        null,
        null,
        {
          action: AuditAction.UPDATE,
          module: AuditModule.SALES,
          entityType: 'Quotation',
          entityId: quotation.id,
          oldValues: { status: 'accepted' },
          newValues: { status: 'converted' },
        },
      );

      // Audit log for sale creation
      await this.auditService.log(
        userId,
        createdByUser?.username || null,
        null,
        null,
        {
          action: AuditAction.CREATE,
          module: AuditModule.SALES,
          entityType: 'Sale',
          entityId: savedSale.id,
          oldValues: null,
          newValues: savedSale,
        },
      );

      return this.findOneSale(savedSale.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findOneSale(id: number): Promise<Sale> {
    const sale = await this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.created_by', 'created_by')
      .leftJoinAndSelect('sale.branch', 'branch')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.payments', 'payments')
      .where('sale.id = :id', { id })
      .getOne();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async getQuotationsAnalytics(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get quotations from last 30 days
    const quotations = await this.quotationRepo
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .where('quotation.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .orderBy('quotation.created_at', 'ASC')
      .getMany();

    // Get total quotations count (all time)
    const totalQuotations = await this.quotationRepo.count();

    // Get total amount for last 30 days
    const totalAmount = quotations.reduce((sum, q) => sum + Number(q.total), 0);

    // Calculate average quotation value for last 30 days
    const averageQuotationValue =
      quotations.length > 0 ? totalAmount / quotations.length : 0;

    // Get converted quotations for conversion rate calculation (all time)
    const convertedQuotations = await this.quotationRepo.count({
      where: { status: 'converted' },
    });

    // Calculate conversion rate
    const conversionRate =
      totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

    // Get status breakdown (all time)
    const statusBreakdown = await this.quotationRepo
      .createQueryBuilder('quotation')
      .select('quotation.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('quotation.status')
      .getRawMany();

    // Convert status breakdown to object
    const statusCounts = {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      converted: 0,
    };

    statusBreakdown.forEach((item) => {
      if (item.status in statusCounts) {
        statusCounts[item.status] = parseInt(item.count);
      }
    });

    // Get daily quotations for last 30 days
    const dailyQuotations: Array<{
      date: string;
      total: number;
      count: number;
    }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      const dayQuotations = quotations.filter((q) => {
        const qDate = new Date(q.created_at);
        qDate.setHours(0, 0, 0, 0);
        return qDate.getTime() === date.getTime();
      });

      const dayTotal = dayQuotations.reduce(
        (sum, q) => sum + Number(q.total),
        0,
      );

      dailyQuotations.push({
        date: dateStr,
        total: dayTotal,
        count: dayQuotations.length,
      });
    }

    return {
      totalQuotations,
      totalAmount,
      averageQuotationValue,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      statusBreakdown: statusCounts,
      dailyQuotations,
    };
  }
}

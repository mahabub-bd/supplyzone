import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
import { Customer } from 'src/customer/entities/customer.entity';
import { Purchase } from 'src/purchase-order/entities/purchase.entity';
import { SalePayment } from 'src/sales/entities/sale-payment.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentType } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,

    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,

    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,

    @InjectRepository(SalePayment)
    private salePaymentRepo: Repository<SalePayment>,

    private accountService: AccountService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreatePaymentDto) {
    return await this.dataSource.transaction(async (manager) => {
      if (dto.type === PaymentType.SUPPLIER) {
        return this.handleSupplierPayment(dto, manager);
      } else if (dto.type === PaymentType.CUSTOMER) {
        return this.handleCustomerPayment(dto, manager);
      } else {
        throw new BadRequestException('Invalid payment type');
      }
    });
  }

  private async handleSupplierPayment(dto: CreatePaymentDto, manager: any) {
    if (!dto.supplier_id) {
      throw new BadRequestException(
        'supplier_id is required for supplier payment',
      );
    }
    if (!dto.purchase_id) {
      throw new BadRequestException(
        'purchase_id is required for purchase payment',
      );
    }

    const supplier = await manager.getRepository(Supplier).findOne({
      where: { id: dto.supplier_id },
      relations: ['account'],
    });

    if (!supplier) throw new NotFoundException('Supplier not found');

    // Get or create supplier's payable account (same as purchase service)
    const supplierAccount = await this.accountService.getOrCreateSupplierAccount(
      dto.supplier_id,
      supplier.name
    );
    const supplierAccountCode = supplierAccount.code;

    const purchase = await manager.getRepository(Purchase).findOne({
      where: { id: dto.purchase_id },
    });

    if (!purchase) throw new NotFoundException('Purchase not found');

    const amount = Number(dto.amount);
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
    if (amount > Number(purchase.due_amount)) {
      throw new BadRequestException(
        `Payment exceeds due amount. Due: ${purchase.due_amount}`,
      );
    }

    const savedPayment = await manager.save(
      manager.create(Payment, {
        ...dto,
        amount,
        supplier_id: dto.supplier_id,
        purchase_id: dto.purchase_id,
      }),
    );

    purchase.paid_amount = Number(purchase.paid_amount) + amount;
    purchase.due_amount = Number(purchase.total) - Number(purchase.paid_amount);
    await manager.save(purchase);

    // Determine payment account: use payment_account_code if provided, otherwise map from method
    const paymentAccountCode = dto.payment_account_code
      ? dto.payment_account_code
      : this.mapPaymentMethod(dto.method);

    await this.accountService.createTransaction('supplier_payment', savedPayment.id, [
      {
        account_code: supplierAccountCode, // Supplier Payable
        debit: amount,
        credit: 0,
        narration: `Supplier payment for Purchase #${purchase.id}`,
      },
      {
        account_code: paymentAccountCode, // Cash / Bank / Mobile
        debit: 0,
        credit: amount,
        narration: `Paid via ${dto.method} for Supplier payment`,
      },
    ]);

    return {
      message: 'Supplier payment successful',
      payment: savedPayment,
      remaining_due: purchase.due_amount,
      supplier_account: supplierAccountCode,
      cash_or_bank_account: paymentAccountCode,
    };
  }

  private async handleCustomerPayment(dto: CreatePaymentDto, manager: any) {
    if (!dto.customer_id) {
      throw new BadRequestException(
        'customer_id is required for customer payment',
      );
    }
    if (!dto.sale_id) {
      throw new BadRequestException('sale_id is required for sale payment');
    }

    const customer = await manager.getRepository(Customer).findOne({
      where: { id: dto.customer_id },
      relations: ['account'],
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const sale = await manager.getRepository(Sale).findOne({
      where: { id: dto.sale_id },
      relations: ['payments'],
    });

    if (!sale) throw new NotFoundException('Sale not found');

    const amount = Number(dto.amount);
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    // Calculate current due amount
    const dueAmount = Number(sale.total) - Number(sale.paid_amount);

    if (amount > dueAmount) {
      throw new BadRequestException(
        `Payment exceeds due amount. Due: ${dueAmount}`,
      );
    }

    // Save payment record
    const savedPayment = await manager.save(
      manager.create(Payment, {
        ...dto,
        amount,
        customer_id: dto.customer_id,
        sale_id: dto.sale_id,
      }),
    );

    // Update sale paid amount
    sale.paid_amount = Number(sale.paid_amount) + amount;

    // Update sale status based on payment
    if (sale.paid_amount >= sale.total) {
      sale.status = 'completed';
    } else if (sale.paid_amount > 0) {
      sale.status = 'held'; // Partial payment
    }

    await manager.save(sale);

    // Create sale payment record
    const paymentAccountCode = dto.payment_account_code
      ? dto.payment_account_code
      : this.mapPaymentMethod(dto.method);

    await manager.save(
      manager.create(SalePayment, {
        sale: sale,
        method: dto.method,
        amount: amount,
        account_code: paymentAccountCode,
        reference: dto.note || null,
      }),
    );

    // Determine AR account code
    let arCode = 'ASSET.ACCOUNTS_RECEIVABLE';
    if (customer && customer.account) {
      arCode = `AR.CUSTOMER.${customer.id}`;
    }

    // Check if AR was already cleared during sale creation
    // Get all transactions for this sale to see if AR credit already exists
    const transactions = await manager.query(
      `SELECT e.id
       FROM account_entries e
       JOIN account_transactions t ON e.transaction_id = t.id
       JOIN accounts a ON e.account_id = a.id
       WHERE a.code = $1
       AND e.credit > 0
       AND t.reference_type = 'sale'
       AND t.reference_id = $2`,
      [arCode, sale.id]
    );

    const hasExistingArCredit = transactions.length > 0;

    const journalLines = [
      {
        account_code: paymentAccountCode, // Cash/Bank/Mobile (debit)
        debit: amount,
        credit: 0,
        narration: `Customer payment for Sale #${sale.id}`,
      },
    ];

    // Only clear AR if it wasn't already cleared during sale creation
    if (!hasExistingArCredit) {
      journalLines.push({
        account_code: arCode, // Accounts Receivable (credit)
        debit: 0,
        credit: amount,
        narration: `Payment received via ${dto.method}`,
      });
    }

    // Post accounting transaction
    await this.accountService.createTransaction(
      'sale_payment',
      savedPayment.id,
      journalLines,
    );

    const newDueAmount = Number(sale.total) - Number(sale.paid_amount);

    return {
      message: 'Customer payment successful',
      payment: savedPayment,
      remaining_due: newDueAmount,
      customer_account: arCode,
      cash_or_bank_account: paymentAccountCode,
    };
  }

  // -------------------------------------------------------------
  // HELPER — Map payment method to Account Code
  // -------------------------------------------------------------
  private mapPaymentMethod(method: string) {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'ASSET.CASH';
      case 'bank':
        return 'ASSET.BANK';
      case 'mobile':
        return 'ASSET.MOBILE';
      default:
        return 'ASSET.CASH';
    }
  }

  // -------------------------------------------------------------
  // GET ALL PAYMENTS
  // -------------------------------------------------------------
  async findAll(options: {
    page?: number;
    limit?: number;
    type?: string;
    method?: string;
  } = {}) {
    const { page = 1, limit = 20, type, method } = options;

    const queryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.supplier', 'supplier')
      .leftJoinAndSelect('payment.purchase', 'purchase')
      .leftJoinAndSelect('payment.customer', 'customer')
      .leftJoinAndSelect('payment.sale', 'sale')
      .orderBy('payment.created_at', 'DESC');

    // Filter by payment type
    if (type && ['supplier', 'customer'].includes(type.toLowerCase())) {
      queryBuilder.andWhere('payment.type = :type', { type: type.toLowerCase() });
    }

    // Filter by payment method
    if (method && ['cash', 'bank', 'mobile'].includes(method.toLowerCase())) {
      queryBuilder.andWhere('payment.method = :method', { method: method.toLowerCase() });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const payments = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Data retrieved successfully',
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // -------------------------------------------------------------
  // GET SINGLE PAYMENT
  // -------------------------------------------------------------
  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['supplier', 'purchase', 'customer', 'sale'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

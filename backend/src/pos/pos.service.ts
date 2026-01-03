import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountTransaction } from 'src/account/entities/account-transaction.entity';
import { CashRegisterService } from 'src/cash-register/cash-register.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { CreateSaleDto } from 'src/sales/dto/create-sale.dto';
import { Sale } from 'src/sales/entities/sale.entity';
import { SalesService } from 'src/sales/sales.service';
import { Repository } from 'typeorm';
import { CreatePosSaleDto, PaymentMethod } from './dto/create-pos-sale.dto';

@Injectable()
export class PosService {
  constructor(
    private salesService: SalesService,
    private cashRegisterService: CashRegisterService,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(AccountTransaction)
    private transactionRepo: Repository<AccountTransaction>,
  ) {}

  /**
   * Create a POS sale - simplified interface for quick sales
   */
  async createPosSale(dto: CreatePosSaleDto, userId: number) {
    // Validate cash register for cash payments
    if (dto.payment_method === PaymentMethod.CASH) {
      if (!dto.cash_register_id) {
        throw new BadRequestException(
          'Cash register ID is required for cash payments',
        );
      }
      // Verify cash register is open
      const cashRegister = await this.cashRegisterService.findOne(
        dto.cash_register_id,
      );
      if (cashRegister.status !== 'open') {
        throw new BadRequestException('Cash register is not open');
      }
    }

    // Map POS DTO to Sales DTO
    const saleDto: CreateSaleDto = {
      items: dto.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        warehouse_id: item.warehouse_id,
        discount_value: item.discount || 0,
        discount_type: 'fixed' as any,
      })),
      branch_id: dto.branch_id,
      customer_id: dto.customer_id,
      discount_value: dto.discount || 0,
      discount_type: dto.discount_type || ('fixed' as any),
      tax_percentage: dto.tax_percentage || 0,
      paid_amount: dto.paid_amount,
      payments: [
        {
          method: dto.payment_method,
          amount: dto.paid_amount,
          account_code:
            dto.account_code || this.getAccountCode(dto.payment_method),
        },
      ],
      sale_type: 'pos', // Mark as POS sale
      served_by_id: userId, // Set the cashier/user who served
    };

    // Use existing sales service to create the sale
    const sale = await this.salesService.create(saleDto, userId);

    // Record transaction in cash register if it's a cash payment
    if (dto.payment_method === PaymentMethod.CASH && dto.cash_register_id) {
      await this.cashRegisterService.recordSaleTransaction(
        sale,
        dto.cash_register_id,
      );
    }

    return sale;
  }

  /**
   * Get all POS sales with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Sale>> {
    const { page = 1, limit = 20 } = paginationDto;

    const [data, total] = await this.saleRepo.findAndCount({
      relations: [
        'items',
        'payments',
        'items.product',
        'customer',
        'created_by',
        'served_by',
        'branch',
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
      where: {
        sale_type: 'pos', // Only show POS sales
        status: 'completed',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get today's sales summary
   */
  async getTodaySummary(branch_id?: number) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.payments', 'payments')
      .where('sale.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('sale.status = :status', { status: 'completed' })
      .andWhere('sale.sale_type = :saleType', { saleType: 'pos' }); // Only POS sales

    if (branch_id) {
      query.andWhere('sale.branch_id = :branch_id', { branch_id });
    }

    const sales = await query.getMany();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );
    const totalCash = sales.reduce((sum, sale) => {
      const cashPayments =
        sale.payments?.filter((p) => p.method === 'cash') || [];
      return sum + cashPayments.reduce((s, p) => s + Number(p.amount), 0);
    }, 0);
    const totalCard = sales.reduce((sum, sale) => {
      const cardPayments =
        sale.payments?.filter(
          (p) => p.method === 'bank' || p.method === 'card',
        ) || [];
      return sum + cardPayments.reduce((s, p) => s + Number(p.amount), 0);
    }, 0);
    const totalMobile = sales.reduce((sum, sale) => {
      const mobilePayments =
        sale.payments?.filter((p) => p.method === 'mobile') || [];
      return sum + mobilePayments.reduce((s, p) => s + Number(p.amount), 0);
    }, 0);

    return {
      date: new Date().toISOString().split('T')[0],
      total_sales: totalSales,
      total_revenue: totalRevenue,
      payment_breakdown: {
        cash: totalCash,
        card: totalCard,
        mobile: totalMobile,
      },
    };
  }

  /**
   * Get a single sale by ID
   */
  async findOne(id: number) {
    return await this.salesService.findOneWithRelations(id);
  }

  /**
   * Get transaction history for a POS sale
   */
  async getTransactionHistory(saleId: number) {
    // Get all transactions related to this sale
    const transactions = await this.transactionRepo.find({
      where: [
        { reference_type: 'sale', reference_id: saleId },
        { reference_type: 'sale_cogs', reference_id: saleId },
      ],
      relations: ['entries', 'entries.account'],
      order: { created_at: 'ASC' },
    });

    return transactions.map((txn) => ({
      id: txn.id,
      reference_type: txn.reference_type,
      reference_id: txn.reference_id,
      created_at: txn.created_at,
      entries: txn.entries.map((entry) => ({
        id: entry.id,
        account_code: entry.account?.code || 'N/A',
        account_name: entry.account?.name || 'N/A',
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        narration: entry.narration,
      })),
    }));
  }

  /**
   * Get transaction history with pagination and filters
   */
  async getTransactionHistoryList(
    paginationDto: PaginationDto,
    branch_id?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const { page = 1, limit = 20 } = paginationDto;

    // Build query to get sales with their transaction history
    const queryBuilder = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.branch', 'branch')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.served_by', 'served_by')
      .where('sale.sale_type = :saleType', { saleType: 'pos' })
      .andWhere('sale.status = :status', { status: 'completed' });

    if (branch_id) {
      queryBuilder.andWhere('sale.branch_id = :branch_id', { branch_id });
    }

    if (startDate) {
      queryBuilder.andWhere('sale.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('sale.created_at <= :endDate', { endDate });
    }

    const [sales, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('sale.created_at', 'DESC')
      .getManyAndCount();

    // Get transactions for each sale
    const data = await Promise.all(
      sales.map(async (sale) => {
        const transactions = await this.getTransactionHistory(sale.id);
        return {
          sale_id: sale.id,
          invoice_no: sale.invoice_no,
          branch: sale.branch,
          customer: sale.customer,
          served_by: sale.served_by,
          total: Number(sale.total),
          created_at: sale.created_at,
          transactions,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Map payment method to account code
   */
  private getAccountCode(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'ASSET.CASH';
      case PaymentMethod.BANK:
      case PaymentMethod.CARD:
        return 'ASSET.BANK';
      case PaymentMethod.MOBILE:
        return 'ASSET.MOBILE';
      default:
        return 'ASSET.CASH';
    }
  }
}

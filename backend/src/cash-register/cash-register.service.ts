import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CashTransactionDto } from './dto/cash-transaction.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CashRegisterTransaction } from './entities/cash-register-transaction.entity';
import { CashRegister } from './entities/cash-register.entity';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectRepository(CashRegister)
    private cashRegisterRepo: Repository<CashRegister>,
    @InjectRepository(CashRegisterTransaction)
    private transactionRepo: Repository<CashRegisterTransaction>,
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
  ) {}

  /**
   * Create a new cash register
   */
  async create(name: string, branch_id: number, description?: string) {
    // Validate branch
    const branch = await this.cashRegisterRepo.manager.findOne(Branch, {
      where: { id: branch_id },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Check for duplicate cash register name in the same branch
    const existingCashRegister = await this.cashRegisterRepo.findOne({
      where: {
        name: name.trim(),
        branch: { id: branch_id },
      },
    });

    if (existingCashRegister) {
      throw new BadRequestException(
        `Cash register with name "${name.trim()}" already exists in this branch`,
      );
    }

    const cashRegister = this.cashRegisterRepo.create({
      name: name.trim(),
      description,
      branch,
    });

    return await this.cashRegisterRepo.save(cashRegister);
  }

  /**
   * Get all cash registers for a branch
   */
  async findAll(branch_id?: number): Promise<CashRegister[]> {
    const whereCondition: any = {};
    if (branch_id) {
      whereCondition.branch = { id: branch_id };
    }

    return await this.cashRegisterRepo.find({
      where: whereCondition,
      relations: ['branch', 'opened_by', 'closed_by'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get a specific cash register by ID
   */
  async findOne(id: number): Promise<CashRegister> {
    const cashRegister = await this.cashRegisterRepo.findOne({
      where: { id },
      relations: ['branch', 'opened_by', 'closed_by'],
    });
    if (!cashRegister) {
      throw new NotFoundException('Cash register not found');
    }
    return cashRegister;
  }

  /**
   * Open a cash register
   */
  async openCashRegister(dto: OpenCashRegisterDto, userId: number) {
    const cashRegister = await this.findOne(dto.cash_register_id);
    if (cashRegister.status !== 'closed') {
      throw new BadRequestException('Cash register is already open');
    }

    const user = await this.cashRegisterRepo.manager.findOne(User, {
      where: { id: userId },
    });

    // Update cash register status
    cashRegister.status = 'open';
    cashRegister.opening_balance = dto.opening_balance;
    cashRegister.current_balance = dto.opening_balance;
    cashRegister.opened_by = user;
    cashRegister.opened_at = new Date();
    cashRegister.expected_amount = null;
    cashRegister.actual_amount = null;
    cashRegister.variance = null;
    cashRegister.notes = null;

    await this.cashRegisterRepo.save(cashRegister);

    // Create opening transaction
    await this.createTransaction({
      cash_register_id: dto.cash_register_id,
      transaction_type: 'opening_balance',
      amount: dto.opening_balance,
      payment_method: 'cash',
      description: `Cash register opened with balance: ${dto.opening_balance}`,
      user_id: userId,
      running_balance: dto.opening_balance,
    });

    return cashRegister;
  }

  /**
   * Close a cash register
   */
  async closeCashRegister(dto: CloseCashRegisterDto, userId: number) {
    const cashRegister = await this.findOne(dto.cash_register_id);
    if (cashRegister.status !== 'open') {
      throw new BadRequestException('Cash register is not open');
    }

    const user = await this.cashRegisterRepo.manager.findOne(User, {
      where: { id: userId },
    });

    // Calculate expected amount from transactions
    const expectedAmount = await this.calculateExpectedAmount(
      dto.cash_register_id,
    );
    const variance = dto.actual_amount - expectedAmount;

    // Update cash register status
    cashRegister.status = 'closed';
    cashRegister.closed_by = user;
    cashRegister.closed_at = new Date();
    cashRegister.expected_amount = expectedAmount;
    cashRegister.actual_amount = dto.actual_amount;
    cashRegister.variance = variance;
    cashRegister.notes = dto.notes;

    await this.cashRegisterRepo.save(cashRegister);

    // Create closing transaction
    await this.createTransaction({
      cash_register_id: dto.cash_register_id,
      transaction_type: 'closing_balance',
      amount: dto.actual_amount,
      payment_method: 'cash',
      description: `Cash register closed. Expected: ${expectedAmount}, Actual: ${dto.actual_amount}, Variance: ${variance}`,
      user_id: userId,
      running_balance: dto.actual_amount,
    });

    return {
      cash_register: cashRegister,
      expected_amount: expectedAmount,
      actual_amount: dto.actual_amount,
      variance: variance,
    };
  }

  /**
   * Process a cash transaction (cash in/out)
   */
  async processCashTransaction(dto: CashTransactionDto, userId: number) {
    const cashRegister = await this.findOne(dto.cash_register_id);
    if (cashRegister.status !== 'open') {
      throw new BadRequestException('Cash register is not open');
    }

    const currentBalance = Number(cashRegister.current_balance);
    let newBalance: number;

    if (dto.transaction_type === 'cash_in') {
      newBalance = currentBalance + Number(dto.amount);
    } else {
      if (currentBalance < Number(dto.amount)) {
        throw new BadRequestException('Insufficient cash in register');
      }
      newBalance = currentBalance - Number(dto.amount);
    }

    // Update cash register balance
    cashRegister.current_balance = newBalance;
    await this.cashRegisterRepo.save(cashRegister);

    // Create transaction record
    const transaction = await this.createTransaction({
      cash_register_id: dto.cash_register_id,
      transaction_type: dto.transaction_type,
      amount: dto.amount,
      payment_method: 'cash',
      description: dto.description,
      user_id: userId,
      running_balance: newBalance,
    });

    return {
      cash_register: cashRegister,
      transaction: transaction,
    };
  }

  /**
   * Record a sale transaction in cash register
   */
  async recordSaleTransaction(sale: Sale, cashRegisterId: number) {
    const cashRegister = await this.findOne(cashRegisterId);
    if (cashRegister.status !== 'open') {
      throw new BadRequestException('Cash register is not open');
    }

    const cashPayments =
      sale.payments?.filter((p) => p.method === 'cash') || [];
    let totalCashAmount = cashPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    if (totalCashAmount > 0) {
      const currentBalance = Number(cashRegister.current_balance);
      const newBalance = currentBalance + totalCashAmount;

      // Update cash register balance
      cashRegister.current_balance = newBalance;
      await this.cashRegisterRepo.save(cashRegister);

      // Create sale transaction
      await this.createTransaction({
        cash_register_id: cashRegisterId,
        transaction_type: 'sale',
        amount: totalCashAmount,
        payment_method: 'cash',
        description: `Cash sale - Invoice ${sale.invoice_no}`,
        user_id: sale.served_by?.id || sale.created_by?.id,
        running_balance: newBalance,
        sale_id: sale.id,
        reference_no: sale.invoice_no,
      });
    }
  }

  /**
   * Record a refund transaction in cash register
   */

  /**
   * Get all open/available cash registers for a branch
   */
  async findAvailable(branch_id?: number): Promise<CashRegister[]> {
    const whereCondition: any = { status: 'open' };
    if (branch_id) {
      whereCondition.branch = { id: branch_id };
    }

    return await this.cashRegisterRepo.find({
      where: whereCondition,
      relations: ['branch', 'opened_by'],
      order: { opened_at: 'DESC' },
    });
  }
  async recordRefundTransaction(
    sale: Sale,
    cashRegisterId: number,
    refundAmount: number,
  ) {
    const cashRegister = await this.findOne(cashRegisterId);
    if (cashRegister.status !== 'open') {
      throw new BadRequestException('Cash register is not open');
    }

    const currentBalance = Number(cashRegister.current_balance);
    if (currentBalance < refundAmount) {
      throw new BadRequestException('Insufficient cash in register for refund');
    }

    const newBalance = currentBalance - refundAmount;

    // Update cash register balance
    cashRegister.current_balance = newBalance;
    await this.cashRegisterRepo.save(cashRegister);

    // Create refund transaction
    await this.createTransaction({
      cash_register_id: cashRegisterId,
      transaction_type: 'refund',
      amount: refundAmount,
      payment_method: 'cash',
      description: `Cash refund - Invoice ${sale.invoice_no}`,
      user_id: sale.served_by?.id || sale.created_by?.id,
      running_balance: newBalance,
      sale_id: sale.id,
      reference_no: sale.invoice_no,
    });
  }

  /**
   * Get all cash register transactions across all registers
   */
  async getAllTransactions(
    paginationDto: PaginationDto & {
      cashRegisterId?: number;
      transactionType?:
        | 'sale'
        | 'refund'
        | 'cash_in'
        | 'cash_out'
        | 'opening_balance'
        | 'closing_balance';
    },
  ): Promise<PaginationResponse<CashRegisterTransaction>> {
    const {
      page = 1,
      limit = 50,
      cashRegisterId,
      transactionType,
    } = paginationDto;

    // Build where conditions
    const whereCondition: any = {};
    if (cashRegisterId) {
      whereCondition.cash_register = { id: cashRegisterId };
    }
    if (transactionType) {
      whereCondition.transaction_type = transactionType;
    }

    const [data, total] = await this.transactionRepo.findAndCount({
      where: whereCondition,
      relations: ['cash_register', 'cash_register.branch', 'user', 'sale'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
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
   * Get cash register transactions
   */
  async getTransactions(
    cashRegisterId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<CashRegisterTransaction>> {
    const { page = 1, limit = 50 } = paginationDto;

    const [data, total] = await this.transactionRepo.findAndCount({
      where: { cash_register: { id: cashRegisterId } },
      relations: ['cash_register', 'user', 'sale'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
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
   * Get cash register summary for a specific date
   */
  async getRegisterSummary(cashRegisterId: number, date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.sale', 'sale')
      .where('transaction.cash_register_id = :cashRegisterId', {
        cashRegisterId,
      })
      .andWhere('transaction.created_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .orderBy('transaction.created_at', 'ASC')
      .getMany();

    const summary = {
      opening_balance: 0,
      total_sales: 0,
      total_refunds: 0,
      cash_in: 0,
      cash_out: 0,
      closing_balance: 0,
      transactions: transactions.length,
    };

    transactions.forEach((transaction) => {
      switch (transaction.transaction_type) {
        case 'opening_balance':
          summary.opening_balance = Number(transaction.amount);
          break;
        case 'sale':
          summary.total_sales += Number(transaction.amount);
          break;
        case 'refund':
          summary.total_refunds += Number(transaction.amount);
          break;
        case 'cash_in':
          summary.cash_in += Number(transaction.amount);
          break;
        case 'cash_out':
          summary.cash_out += Number(transaction.amount);
          break;
        case 'closing_balance':
          summary.closing_balance = Number(transaction.amount);
          break;
      }
    });

    summary.closing_balance =
      summary.opening_balance +
      summary.total_sales -
      summary.total_refunds +
      summary.cash_in -
      summary.cash_out;

    return summary;
  }

  private async calculateExpectedAmount(
    cashRegisterId: number,
  ): Promise<number> {
    const transactions = await this.transactionRepo.find({
      where: { cash_register: { id: cashRegisterId } },
      order: { created_at: 'ASC' },
    });

    let expectedAmount = 0;
    transactions.forEach((transaction) => {
      switch (transaction.transaction_type) {
        case 'opening_balance':
          expectedAmount = Number(transaction.amount);
          break;
        case 'sale':
        case 'cash_in':
          expectedAmount += Number(transaction.amount);
          break;
        case 'refund':
        case 'cash_out':
          expectedAmount -= Number(transaction.amount);
          break;
      }
    });

    return expectedAmount;
  }

  private async createTransaction(data: {
    cash_register_id: number;
    transaction_type: string;
    amount: number;
    payment_method: string;
    description: string;
    user_id: number;
    running_balance: number;
    sale_id?: number;
    reference_no?: string;
  }) {
    const cashRegister = await this.cashRegisterRepo.findOne({
      where: { id: data.cash_register_id },
    });
    const user = await this.cashRegisterRepo.manager.findOne(User, {
      where: { id: data.user_id },
    });

    let sale = null;
    if (data.sale_id) {
      sale = await this.cashRegisterRepo.manager.findOne(Sale, {
        where: { id: data.sale_id },
      });
    }

    const transaction = this.transactionRepo.create({
      cash_register: cashRegister,
      transaction_type: data.transaction_type as any,
      amount: data.amount,
      payment_method: data.payment_method as any,
      description: data.description,
      user,
      running_balance: data.running_balance,
      sale,
      reference_no: data.reference_no,
    });

    return await this.transactionRepo.save(transaction);
  }
}

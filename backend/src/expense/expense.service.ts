import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountService } from 'src/account/account.service';
import { ExpenseCategory } from 'src/expense-category/entities/expense-category.entity';
import { Expense } from './entities/expense.entity';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,

    @InjectRepository(ExpenseCategory)
    private categoryRepo: Repository<ExpenseCategory>,

    private accountService: AccountService,
  ) {}

  /**
   * Convert category name → EXPENSE.<CATEGORY_NAME>
   * Example: "Office Supplies" → "EXPENSE.OFFICE_SUPPLIES"
   */
  private formatExpenseAccountCode(categoryName: string): string {
    return `EXPENSE.${categoryName.toUpperCase().replace(/ /g, '_')}`;
  }

  /**
   * Automatically ensure the mapped expense account exists.
   * If not → creates it.
   */
  private async ensureExpenseAccount(categoryName: string): Promise<string> {
    const code = this.formatExpenseAccountCode(categoryName);
    const name = `${categoryName} Expense`;

    const existing = await this.accountService.findAccountByCode(code);
    if (existing) return code;

    // AUTO CREATE NEW EXPENSE ACCOUNT
    await this.accountService.autoCreateExpenseAccount(code, name);

    return code;
  }

  // -----------------------------------------------------
  // CREATE EXPENSE
  // -----------------------------------------------------
  async create(dto: CreateExpenseDto, user: any) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.category_id, is_active: true },
    });

    if (!category) {
      throw new BadRequestException('Invalid or inactive expense category');
    }

    // PAYMENT ACCOUNT (Cash / Bank / Mobile)
    const paymentAccount =
      dto.account_code ||
      (dto.payment_method === 'cash'
        ? 'ASSET.CASH'
        : dto.payment_method === 'bank'
          ? 'ASSET.BANK_IBBL'
          : 'ASSET.MOBILE');

    // Save the expense
    const exp = this.expenseRepo.create({
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      category,
      branch: { id: dto.branch_id },
      created_by: { id: user.id },
    });

    const saved = await this.expenseRepo.save(exp);

    const expenseAccount = await this.ensureExpenseAccount(category.name);

    await this.accountService.createTransaction('expense', saved.id, [
      {
        account_code: expenseAccount,
        debit: dto.amount,
        credit: 0,
        narration: `Expense recorded: ${dto.title}`,
      },
      {
        account_code: paymentAccount,
        debit: 0,
        credit: dto.amount,
        narration: `Paid via ${dto.payment_method} for expense payment`,
      },
    ]);

    return saved;
  }

  // -----------------------------------------------------
  // LIST EXPENSES WITH FILTERS
  // -----------------------------------------------------
  async findAll(filters?: any) {
    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.created_by', 'created_by')
      .leftJoinAndSelect('e.branch', 'branch')
      .leftJoinAndSelect('e.category', 'category')
      .orderBy('e.created_at', 'DESC');

    if (filters?.branch_id)
      qb.andWhere('e.branch_id = :b', { b: filters.branch_id });

    if (filters?.category_id)
      qb.andWhere('e.category_id = :c', { c: filters.category_id });

    if (filters?.start)
      qb.andWhere('DATE(e.created_at) >= :s', { s: filters.start });

    if (filters?.end)
      qb.andWhere('DATE(e.created_at) <= :e', { e: filters.end });

    return qb.getMany();
  }

  // -----------------------------------------------------
  // FIND ONE EXPENSE
  // -----------------------------------------------------
  async findOne(id: number) {
    const data = await this.expenseRepo.findOne({
      where: { id },
      relations: ['created_by', 'branch', 'category'],
    });

    if (!data) throw new NotFoundException('Expense not found');

    return data;
  }

  // -----------------------------------------------------
  // UPDATE EXPENSE
  // -----------------------------------------------------
  async update(id: number, dto: UpdateExpenseDto) {
    const exp = await this.findOne(id);

    if (dto.category_id) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
      });

      if (!category) throw new BadRequestException('Invalid category_id');

      exp.category_id = dto.category_id;
      exp.category = category;
    }

    Object.assign(exp, dto);

    return this.expenseRepo.save(exp);
  }

  // -----------------------------------------------------
  // DELETE EXPENSE
  // -----------------------------------------------------
  async remove(id: number) {
    const exp = await this.findOne(id);
    await this.expenseRepo.remove(exp);

    return { message: 'Expense deleted successfully' };
  }
}

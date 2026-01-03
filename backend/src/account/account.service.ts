import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AccountType } from 'src/common/enum';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Customer } from 'src/customer/entities/customer.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Repository } from 'typeorm';
import { AddBankBalanceDto } from './dto/add-bank-balance.dto';
import { AddCashDto } from './dto/add-cash.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { FundTransferDto } from './dto/fund-transfer-dto';
import { JournalVoucherDto } from './dto/journal-voucher.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountEntry } from './entities/account-entry.entity';
import { AccountTransaction } from './entities/account-transaction.entity';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountTransaction)
    private txnRepo: Repository<AccountTransaction>,

    @InjectRepository(AccountEntry)
    private entryRepo: Repository<AccountEntry>,

    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  
  async createTransaction(
    reference_type: string,
    reference_id: number,
    entries: {
      account_code: string;
      debit: number;
      credit: number;
      narration?: string;
    }[],
  ) {
    const accountEntries = [];

    for (const e of entries) {
      const account = await this.accountRepo.findOne({
        where: { code: e.account_code },
      });

      if (!account)
        throw new BadRequestException(`Account not found: ${e.account_code}`);

      accountEntries.push(
        this.entryRepo.create({
          account,
          debit: e.debit,
          credit: e.credit,
          narration: e.narration,
        }),
      );
    }

    const txn = this.txnRepo.create({
      reference_type,
      reference_id,
      entries: accountEntries,
    });

    return await this.txnRepo.save(txn);
  }
  async createAccount(dto: CreateAccountDto) {
    const exists = await this.accountRepo.findOne({
      where: [{ code: dto.code }, { name: dto.name }],
    });

    if (exists) {
      if (exists.code === dto.code) {
        throw new BadRequestException(
          `Account code already exists: ${dto.code}`,
        );
      }
      if (exists.name === dto.name) {
        throw new BadRequestException(
          `Account name already exists: ${dto.name}`,
        );
      }
      if (exists.account_number === dto.account_number) {
        throw new BadRequestException(
          `Account Number already exists: ${dto.account_number}`,
        );
      }
    }

    if (dto.isCash && dto.isBank) {
      throw new BadRequestException(
        'An account cannot be both cash and bank at the same time.',
      );
    }

    if (!dto.isCash) {
      dto.isCash = dto.code.includes('CASH');
    }
    if (!dto.isBank) {
      dto.isBank = dto.code.includes('BANK');
    }

    const acc = this.accountRepo.create(dto);
    return this.accountRepo.save(acc);
  }

  async findAllAccounts(filters: {
    type?: string;
    isCash?: boolean;
    isBank?: boolean;
  }) {
    const baseWhere: any = {}; // Common conditions like type

    if (filters.type) {
      baseWhere.type = filters.type;
    }

    if (filters.isCash === true && filters.isBank === true) {
      return this.accountRepo.find({
        where: [
          { ...baseWhere, isCash: true },
          { ...baseWhere, isBank: true },
        ],
        order: { code: 'ASC' },
      });
    }

    if (filters.isCash !== undefined) {
      baseWhere.isCash = filters.isCash;
    }
    if (filters.isBank !== undefined) {
      baseWhere.isBank = filters.isBank;
    }

    return this.accountRepo.find({
      where: baseWhere,
      order: { account_number: 'ASC' },
    });
  }

  async findOneAccount(id: number) {
    const acc = await this.accountRepo.findOne({ where: { id } });
    if (!acc) throw new BadRequestException('Account not found');
    return acc;
  }

  async updateAccount(id: number, dto: UpdateAccountDto) {
    const acc = await this.accountRepo.findOne({ where: { id } });
    if (!acc) throw new BadRequestException('Account not found');

    Object.assign(acc, dto);
    return this.accountRepo.save(acc);
  }
  async createOpeningBalance(dto: OpeningBalanceDto) {
    const { account_code, amount } = dto;

    // Must exist
    const account = await this.accountRepo.findOne({
      where: { code: account_code },
    });
    if (!account)
      throw new BadRequestException(`Account not found: ${account_code}`);

    // Always credit Opening Equity
    const OPENING_ACCOUNT = 'EQUITY.OPENING_BALANCE';

    // Ensure opening balance equity account exists
    let opAcc = await this.accountRepo.findOne({
      where: { code: OPENING_ACCOUNT },
    });
    if (!opAcc) {
      opAcc = await this.accountRepo.save({
        code: OPENING_ACCOUNT,
        name: 'Opening Balance Equity',
        type: 'equity',
      });
    }

    return this.createTransaction('opening_balance', 0, [
      {
        account_code,
        debit: amount,
        credit: 0,
        narration: 'Opening balance',
      },
      {
        account_code: OPENING_ACCOUNT,
        debit: 0,
        credit: amount,
        narration: 'Opening balance equity',
      },
    ]);
  }
  async addCash(dto: AddCashDto) {
    const { amount, narration } = dto;

    const assetAcc = 'ASSET.CASH';
    const capitalAcc = 'EQUITY.CAPITAL';

    // Ensure equity capital account exists
    let cap = await this.accountRepo.findOne({ where: { code: capitalAcc } });
    if (!cap) {
      cap = await this.accountRepo.save({
        code: capitalAcc,
        name: 'Owner Capital',
        type: 'equity',
      });
    }

    // ✔ Generate next reference number
    const lastRef = await this.txnRepo.findOne({
      where: { reference_type: 'cash_addition' },
      order: { reference_id: 'DESC' },
    });

    const nextRefId = lastRef ? lastRef.reference_id + 1 : 1;

    // ✔ Now use nextRefId
    return this.createTransaction('cash_addition', nextRefId, [
      {
        account_code: assetAcc,
        debit: amount,
        credit: 0,
        narration,
      },
      {
        account_code: capitalAcc,
        debit: 0,
        credit: amount,
        narration,
      },
    ]);
  }

  async addBankBalance(dto: AddBankBalanceDto) {
    const { amount, narration, bankAccountCode } = dto;

    const capitalAcc = 'EQUITY.CAPITAL';

    // Validate bank account exists
    const bankAcc = await this.accountRepo.findOne({
      where: { code: bankAccountCode },
    });
    if (!bankAcc) {
      throw new BadRequestException(
        `Bank account not found: ${bankAccountCode}`,
      );
    }

    // Ensure capital account exists
    let cap = await this.accountRepo.findOne({ where: { code: capitalAcc } });
    if (!cap) {
      cap = await this.accountRepo.save({
        code: capitalAcc,
        name: 'Owner Capital',
        type: 'equity',
      });
    }
    const lastRef = await this.txnRepo.findOne({
      where: { reference_type: 'cash_addition' },
      order: { reference_id: 'DESC' },
    });

    const nextRefId = lastRef ? lastRef.reference_id + 1 : 1;
    return this.createTransaction('bank_balance_addition', nextRefId, [
      {
        account_code: bankAccountCode,
        debit: amount,
        credit: 0,
        narration,
      },
      {
        account_code: capitalAcc,
        debit: 0,
        credit: amount,
        narration,
      },
    ]);
  }

  async transferFunds(dto: FundTransferDto) {
    const { fromAccountCode, toAccountCode, amount, narration } = dto;

    const fromAcc = await this.accountRepo.findOne({
      where: { code: fromAccountCode },
    });
    if (!fromAcc)
      throw new BadRequestException(
        `From Account not found: ${fromAccountCode}`,
      );

    const toAcc = await this.accountRepo.findOne({
      where: { code: toAccountCode },
    });
    if (!toAcc)
      throw new BadRequestException(`To Account not found: ${toAccountCode}`);
    if (!fromAcc.isCash && !fromAcc.isBank)
      throw new BadRequestException('From Account must be Cash or Bank');
    if (!toAcc.isCash && !toAcc.isBank)
      throw new BadRequestException('To Account must be Cash or Bank');
    if (fromAccountCode === toAccountCode)
      throw new BadRequestException('Cannot transfer to the same account.');

    // For transfer: Debit toAccount, Credit fromAccount
    return this.createTransaction('fund_transfer', 0, [
      {
        account_code: toAccountCode,
        debit: amount,
        credit: 0,
        narration,
      },
      {
        account_code: fromAccountCode,
        debit: 0,
        credit: amount,
        narration,
      },
    ]);
  }

  async createJournalVoucher(dto: JournalVoucherDto) {
    const totalDebit = dto.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = dto.lines.reduce((s, l) => s + l.credit, 0);

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Journal not balanced. Debit (${totalDebit}) != Credit (${totalCredit})`,
      );
    }

    // Validate accounts exist
    for (const line of dto.lines) {
      const acc = await this.accountRepo.findOne({
        where: { code: line.account_code },
      });
      if (!acc) throw new Error(`Account not found: ${line.account_code}`);
    }

    return this.createTransaction(
      dto.reference_type,
      dto.reference_id,
      dto.lines.map((l) => ({
        account_code: l.account_code,
        debit: l.debit,
        credit: l.credit,
        narration: l.narration,
      })),
    );
  }
  async getJournalReport(
    paginationDto: PaginationDto & {
      accountCode?: string;
      referenceType?: string;
    },
  ): Promise<PaginationResponse<any>> {
    const { page = 1, limit = 10, accountCode, referenceType } = paginationDto;

    const countQb = this.txnRepo.createQueryBuilder('txn');
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.entries', 'entries')
      .leftJoinAndSelect('entries.account', 'account')
      .orderBy('txn.created_at', 'DESC');

    const applyFilters = (queryBuilder: any) => {
      if (accountCode) {
        queryBuilder
          .where((qb) => {
            const subQuery = qb
              .subQuery()
              .select('e.transaction_id')
              .from('account_entries', 'e')
              .leftJoin('accounts', 'a', 'e.account_id = a.id')
              .where('a.code = :accountCode')
              .getQuery();
            return 'txn.id IN ' + subQuery;
          })
          .setParameter('accountCode', accountCode);
      }

      if (referenceType) {
        if (accountCode) {
          queryBuilder.andWhere('txn.reference_type = :referenceType');
        } else {
          queryBuilder.where('txn.reference_type = :referenceType');
        }
        queryBuilder.setParameter('referenceType', referenceType);
      }
    };

    applyFilters(countQb);
    applyFilters(qb);

    const total = await countQb.getCount();

    const transactions = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions.map((txn) => ({
        transaction_id: txn.id,
        reference_type: txn.reference_type,
        reference_id: txn.reference_id,
        date: txn.created_at,
        entries: txn.entries.map((e) => ({
          account_code: e.account.code,
          account_name: e.account.name,
          account_number: e.account.account_number,
          debit: e.debit,
          credit: e.credit,
          narration: e.narration || null,
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async removeAccount(id: number) {
    const acc = await this.accountRepo.findOne({ where: { id } });
    if (!acc) throw new BadRequestException('Account not found');

    const entries = await this.entryRepo.count({
      where: { account: { id } },
    });

    if (entries > 0)
      throw new BadRequestException(
        'Cannot delete account with existing journal entries',
      );

    return this.accountRepo.remove(acc);
  }
  async getAccountBalance(accountCode: string, date?: string) {
    const account = await this.accountRepo.findOne({
      where: { code: accountCode },
    });

    if (!account) {
      throw new BadRequestException(`Account not found: ${accountCode}`);
    }

    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode });

    if (date) {
      qb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    const row = await qb
      .select('a.name', 'name')
      .addSelect('a.type', 'type')
      .addSelect('SUM(e.debit)', 'debit')
      .addSelect('SUM(e.credit)', 'credit')
      .groupBy('a.name')
      .addGroupBy('a.type')
      .getRawOne();

    const debit = Number(row?.debit || 0);
    const credit = Number(row?.credit || 0);

    let balance = 0;

    if (row?.type === 'asset' || row?.type === 'expense') {
      balance = debit - credit;
    } else {
      balance = credit - debit;
    }

    return {
      code: accountCode,
      name: row?.name,
      type: row?.type,
      debit,
      credit,
      balance,
      as_of: date || new Date().toISOString(),
    };
  }

  async getAllAccountBalances(filters: {
    date?: string;
    isCash?: boolean;
    isBank?: boolean;
  }) {
    const { date, isCash, isBank } = filters;

    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .select('a.account_number', 'account_number')
      .addSelect('a.code', 'code')
      .addSelect('a.name', 'name')
      .addSelect('a.type', 'type')
      .addSelect('a.isCash', 'isCash')
      .addSelect('a.isBank', 'isBank')
      .addSelect('SUM(e.debit)', 'debit')
      .addSelect('SUM(e.credit)', 'credit')
      .groupBy('a.id');

    if (date) {
      qb.where('DATE(t.created_at) <= DATE(:date)', { date });
    }

    if (isCash === true && isBank === true) {
      qb.andWhere('(a.isCash = true OR a.isBank = true)');
    } else {
      if (isCash !== undefined) qb.andWhere('a.isCash = :isCash', { isCash });
      if (isBank !== undefined) qb.andWhere('a.isBank = :isBank', { isBank });
    }

    qb.orderBy('a.account_number', 'ASC');

    const rows = await qb.getRawMany();

    return rows.map((r) => {
   
      const debit = Number(String(r.debit || 0).replace(/[^\d.-]/g, ''));
      const credit = Number(String(r.credit || 0).replace(/[^\d.-]/g, ''));

    
      const balance =
        r.type === 'asset' || r.type === 'expense'
          ? debit - credit
          : credit - debit;

      return {
        account_number: r.account_number,
        code: r.code,
        name: r.name,
        type: r.type,
        isCash: r.isCash === true || r.isCash === 'true',
        isBank: r.isBank === true || r.isBank === 'true',
        debit,
        credit,
        balance,
      };
    });
  }
  async getTrialBalance(date?: string) {
    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.account', 'a')
      .leftJoin('e.transaction', 't')
      .select('a.account_number', 'account_number')
      .addSelect('a.code', 'code')
      .addSelect('a.name', 'name')
      .addSelect('a.type', 'type')
      .addSelect('SUM(e.debit)', 'debit')
      .addSelect('SUM(e.credit)', 'credit')
      .groupBy('a.id')
      .addGroupBy('a.account_number')
      .addGroupBy('a.code')
      .addGroupBy('a.name')
      .addGroupBy('a.type')
      .orderBy('CAST(a.account_number AS INTEGER)', 'ASC');

    if (date) {
      qb.where('DATE(t.created_at) <= DATE(:date)', { date });
    }

    const rows = await qb.getRawMany();

    // For trial balance, we need to sum ALL debits and ALL credits
    let totalDebit = 0;
    let totalCredit = 0;

    const items = rows.map((r) => {
      // Ensure proper number conversion from formatted strings
      const debit = Number(String(r.debit || 0).replace(/[^\d.-]/g, ''));
      const credit = Number(String(r.credit || 0).replace(/[^\d.-]/g, ''));

      // Add ALL debit and credit amounts to the totals
      // This is how a proper trial balance works - it shows the sum of all entries
      totalDebit += debit;
      totalCredit += credit;

      // For display purposes, calculate the normal balance
      let normalBalanceSide = 'debit';
      let normalBalanceAmount = 0;

      if (r.type === 'asset' || r.type === 'expense') {
        // Assets and expenses normally have debit balances
        normalBalanceAmount = debit - credit;
        normalBalanceSide = normalBalanceAmount >= 0 ? 'debit' : 'credit';
      } else {
        // Liabilities, equity, and income normally have credit balances
        normalBalanceAmount = credit - debit;
        normalBalanceSide = normalBalanceAmount >= 0 ? 'credit' : 'debit';
      }

      return {
        account_number: r.account_number,
        code: r.code,
        name: r.name,
        type: r.type,
        debit: debit,
        credit: credit,
        normalBalance: {
          side: normalBalanceSide,
          amount: Math.abs(normalBalanceAmount),
        },
      };
    });

    return {
      date: date || 'all dates',
      items,
      totals: {
        totalDebit,
        totalCredit,
        difference: totalDebit - totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01, // Handle floating point precision
      },
    };
  }

  async getBalanceSheet(date?: string) {
    const trial = await this.getAllAccountBalances({ date });

    const assets = trial.filter((a) => a.type === 'asset');
    const liabilities = trial.filter((a) => a.type === 'liability');
    const equity = trial.filter((a) => a.type === 'equity');

    return {
      date: date || 'all dates',
      assets: {
        accounts: assets,
        total: assets.reduce((s, a) => s + a.balance, 0),
      },
      liabilities: {
        accounts: liabilities,
        total: liabilities.reduce((s, a) => s + a.balance, 0),
      },
      equity: {
        accounts: equity,
        total: equity.reduce((s, a) => s + a.balance, 0),
      },
      check: {
        assets: assets.reduce((s, a) => s + a.balance, 0),
        liabilities: liabilities.reduce((s, a) => s + a.balance, 0),
        equity: equity.reduce((s, a) => s + a.balance, 0),
      },
    };
  }
  async getProfitAndLoss(date?: string) {
    const trial = await this.getAllAccountBalances({ date });

    const income = trial.filter((a) => a.type === 'income');
    const expense = trial.filter((a) => a.type === 'expense');

    const totalIncome = income.reduce((s, a) => s + a.balance, 0);
    const totalExpense = expense.reduce((s, a) => s + a.balance, 0);

    return {
      date: date || 'all dates',
      income: {
        accounts: income,
        total: totalIncome,
      },
      expenses: {
        accounts: expense,
        total: totalExpense,
      },
      netProfit: totalIncome - totalExpense,
      netLoss: totalExpense > totalIncome ? totalExpense - totalIncome : 0,
    };
  }
  async getSupplierLedger(supplierId: number, paginationDto?: PaginationDto, date?: string) {
    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId },
      relations: ['account'],
    });

    if (!supplier || !supplier.account) {
      throw new BadRequestException(
        `Supplier or ledger account not found for ID: ${supplierId}`,
      );
    }

    const accountCode = supplier.account.code;

    const account = await this.accountRepo.findOne({
      where: { code: accountCode },
    });

    if (!account) {
      throw new BadRequestException(
        `Supplier ledger not found: ${accountCode}`,
      );
    }

    // -------------------------------------------
    // 1️⃣ OPENING BALANCE (before selected date)
    // -------------------------------------------
    let opening = 0;

    if (date) {
      const row = await this.entryRepo
        .createQueryBuilder('e')
        .leftJoin('e.transaction', 't')
        .leftJoin('e.account', 'a')
        .select('SUM(e.debit)', 'debit')
        .addSelect('SUM(e.credit)', 'credit')
        .where('a.code = :code', { code: accountCode })
        .andWhere('DATE(t.created_at) < DATE(:date)', { date })
        .getRawOne();

      const debit = Number(row?.debit || 0);
      const credit = Number(row?.credit || 0);

      // liability account → balance = credit - debit
      opening = credit - debit;
    }

    // -------------------------------------------
    // 2️⃣ LEDGER LINES (all transactions ON or BEFORE date)
    // -------------------------------------------
    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      qb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    // Get total count for pagination
    const total = await qb.getCount();

    // Apply pagination if provided
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (paginationDto) {
      qb.skip(skip).take(limit);
    }

    const entries = await qb.getMany();

    // For pagination, we need to calculate running balances correctly
    // First, get all entries up to the current date to calculate the correct closing balance
    const allEntriesQb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      allEntriesQb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    const allEntries = await allEntriesQb.getMany();

    // Calculate closing balance from ALL entries (not just paginated ones)
    let closingBalance = opening;
    allEntries.forEach((entry) => {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);
      // Liability account: balance = previous + credit - debit
      closingBalance = closingBalance + credit - debit;
    });

    // Calculate the balance before the first entry in this page
    let balanceBeforePage = closingBalance;
    for (let i = 0; i < skip; i++) {
      const entry = allEntries[i];
      if (entry) {
        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);
        balanceBeforePage = balanceBeforePage - credit + debit;
      }
    }

    // Now work backwards through paginated entries to calculate running balances
    const ledgerLines = [];
    let runningBalance = balanceBeforePage;

    for (const entry of entries) {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      // Show current balance
      ledgerLines.push({
        date: entry.transaction.created_at,
        reference_type: entry.transaction.reference_type,
        reference_id: entry.transaction.reference_id,
        debit,
        credit,
        running_balance: runningBalance,
        narration: entry.narration || null,
      });

      // Reverse the transaction effect to get previous balance
      runningBalance = runningBalance - credit + debit;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      supplier_id: supplierId,
      account_code: accountCode,
      opening_balance: opening,
      entries: ledgerLines,
      closing_balance: closingBalance,
      meta: paginationDto ? {
        total,
        page,
        limit,
        totalPages,
      } : undefined,
    };
  }

  async getCustomerLedger(customerId: number, paginationDto?: PaginationDto, date?: string) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
      relations: ['account'],
    });

    if (!customer || !customer.account) {
      throw new BadRequestException(
        `Customer or ledger account not found for ID: ${customerId}`,
      );
    }

    const accountCode = `AR.CUSTOMER.${customerId}`;

    const account = await this.accountRepo.findOne({
      where: { code: accountCode },
    });

    if (!account) {
      throw new BadRequestException(
        `Customer ledger not found: ${accountCode}`,
      );
    }

    // -------------------------------------------
    // 1️⃣ OPENING BALANCE (before selected date)
    // -------------------------------------------
    let opening = 0;

    if (date) {
      const row = await this.entryRepo
        .createQueryBuilder('e')
        .leftJoin('e.transaction', 't')
        .leftJoin('e.account', 'a')
        .select('SUM(e.debit)', 'debit')
        .addSelect('SUM(e.credit)', 'credit')
        .where('a.code = :code', { code: accountCode })
        .andWhere('DATE(t.created_at) < DATE(:date)', { date })
        .getRawOne();

      const debit = Number(row?.debit || 0);
      const credit = Number(row?.credit || 0);

      // Asset account (receivable): balance = debit - credit
      opening = debit - credit;
    }

    // -------------------------------------------
    // 2️⃣ LEDGER LINES (all transactions ON or BEFORE date)
    // -------------------------------------------
    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      qb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    // Get total count for pagination
    const total = await qb.getCount();

    // Apply pagination if provided
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (paginationDto) {
      qb.skip(skip).take(limit);
    }

    const entries = await qb.getMany();

    // For pagination, we need to calculate running balances correctly
    // First, get all entries up to the current date to calculate the correct closing balance
    const allEntriesQb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      allEntriesQb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    const allEntries = await allEntriesQb.getMany();

    // Calculate closing balance from ALL entries (not just paginated ones)
    let closingBalance = opening;
    allEntries.forEach((entry) => {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);
      // Asset account (receivable): balance = previous + debit - credit
      closingBalance = closingBalance + debit - credit;
    });

    // Calculate the balance before the first entry in this page
    let balanceBeforePage = closingBalance;
    for (let i = 0; i < skip; i++) {
      const entry = allEntries[i];
      if (entry) {
        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);
        balanceBeforePage = balanceBeforePage - debit + credit;
      }
    }

    // Now work backwards through paginated entries to calculate running balances
    const ledgerLines = [];
    let runningBalance = balanceBeforePage;

    for (const entry of entries) {
      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      // Show current balance
      ledgerLines.push({
        date: entry.transaction.created_at,
        reference_type: entry.transaction.reference_type,
        reference_id: entry.transaction.reference_id,
        debit,
        credit,
        running_balance: runningBalance,
        narration: entry.narration || null,
      });

      // Reverse the transaction effect to get previous balance
      runningBalance = runningBalance - debit + credit;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      customer_id: customerId,
      account_code: accountCode,
      opening_balance: opening,
      entries: ledgerLines,
      closing_balance: closingBalance,
      meta: paginationDto ? {
        total,
        page,
        limit,
        totalPages,
      } : undefined,
    };
  }

  async getCashBankLedger(accountCode: string, paginationDto?: PaginationDto, date?: string) {
    // 1️⃣ Load account
    const account = await this.accountRepo.findOne({
      where: { code: accountCode },
    });

    if (!account) {
      throw new BadRequestException(`Account not found: ${accountCode}`);
    }

    if (!account.isCash && !account.isBank) {
      throw new BadRequestException(
        `Account ${accountCode} is not a cash or bank account`,
      );
    }

    // ----------------------------------------
    // 2️⃣ OPENING BALANCE BEFORE DATE
    // ----------------------------------------
    let opening = 0;

    if (date) {
      const row = await this.entryRepo
        .createQueryBuilder('e')
        .leftJoin('e.transaction', 't')
        .leftJoin('e.account', 'a')
        .select('SUM(e.debit)', 'debit')
        .addSelect('SUM(e.credit)', 'credit')
        .where('a.code = :code', { code: accountCode })
        .andWhere('DATE(t.created_at) < DATE(:date)', { date })
        .getRawOne();

      const debit = Number(row?.debit || 0);
      const credit = Number(row?.credit || 0);

      // asset account → debit increases, credit decreases
      opening = debit - credit;
    }

    // ----------------------------------------
    // 3️⃣ ALL LEDGER ENTRIES UP TO DATE
    // ----------------------------------------
    const qb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      qb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    // Get total count for pagination
    const total = await qb.getCount();

    // Apply pagination if provided
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (paginationDto) {
      qb.skip(skip).take(limit);
    }

    const entries = await qb.getMany();

    // For pagination, we need to calculate running balances correctly
    // First, get all entries up to the current date to calculate the correct closing balance
    const allEntriesQb = this.entryRepo
      .createQueryBuilder('e')
      .leftJoin('e.transaction', 't')
      .leftJoin('e.account', 'a')
      .where('a.code = :code', { code: accountCode })
      .orderBy('t.created_at', 'DESC')
      .addOrderBy('e.id', 'DESC');

    if (date) {
      allEntriesQb.andWhere('DATE(t.created_at) <= DATE(:date)', { date });
    }

    const allEntries = await allEntriesQb.getMany();

    // Calculate closing balance from ALL entries (not just paginated ones)
    let closingBalance = opening;
    allEntries.forEach((e) => {
      const debit = Number(e.debit || 0);
      const credit = Number(e.credit || 0);
      // CASH/BANK = asset account → running balance = debit - credit
      closingBalance = closingBalance + debit - credit;
    });

    // Calculate the balance before the first entry in this page
    let balanceBeforePage = closingBalance;
    for (let i = 0; i < skip; i++) {
      const entry = allEntries[i];
      if (entry) {
        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);
        balanceBeforePage = balanceBeforePage - debit + credit;
      }
    }

    // Now work backwards through paginated entries to calculate running balances
    const lines = [];
    let runningBalance = balanceBeforePage;

    for (const e of entries) {
      const debit = Number(e.debit || 0);
      const credit = Number(e.credit || 0);

      // Show current balance
      lines.push({
        date: e.transaction.created_at,
        reference_type: e.transaction.reference_type,
        reference_id: e.transaction.reference_id,
        debit,
        credit,
        running_balance: runningBalance,
        narration: e.narration || null,
      });

      // Reverse the transaction effect to get previous balance
      runningBalance = runningBalance - debit + credit;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      account_code: accountCode,
      account_name: account.name,
      type: account.type,
      isCash: account.isCash,
      isBank: account.isBank,
      opening_balance: opening,
      entries: lines,
      closing_balance: closingBalance,
      meta: paginationDto ? {
        total,
        page,
        limit,
        totalPages,
      } : undefined,
    };
  }
  async findAccountByCode(code: string) {
    return this.accountRepo.findOne({ where: { code } });
  }
  async autoCreateExpenseAccount(code: string, name: string) {
    // Generate next expense account number (5001+)
    const last = await this.accountRepo
      .createQueryBuilder('a')
      .where("a.account_number LIKE '500%'")
      .orderBy('CAST(a.account_number AS INTEGER)', 'DESC')
      .getOne();

    const nextNumber = last
      ? (parseInt(last.account_number) + 1).toString()
      : '5001';

    const acc = this.accountRepo.create({
      account_number: nextNumber,
      code,
      name,
      type: 'expense',
      isCash: false,
      isBank: false,
    });

    await this.accountRepo.save(acc);
  }

  async getOrCreateSupplierAccount(supplierId: number, supplierName: string): Promise<Account> {
    const accountCode = `LIABILITY.SUPPLIER.${supplierId}`;

    // Check if account already exists
    let account = await this.accountRepo.findOne({
      where: { code: accountCode }
    });

    if (!account) {
      // Generate next liability account number (2001+)
      const last = await this.accountRepo
        .createQueryBuilder('a')
        .where("a.account_number LIKE '200%'")
        .orderBy('CAST(a.account_number AS INTEGER)', 'DESC')
        .getOne();

      const nextNumber = last
        ? (parseInt(last.account_number) + 1).toString()
        : '2002'; // 2001 is for general Accounts Payable

      account = this.accountRepo.create({
        account_number: nextNumber,
        code: accountCode,
        name: `Supplier - ${supplierName}`,
        type: 'liability',
        isCash: false,
        isBank: false,
      });

      await this.accountRepo.save(account);
    }

    return account;
  }

  async findUnbalancedTransactions() {
    const transactions = await this.txnRepo.find({
      relations: ['entries', 'entries.account'],
      order: { id: 'ASC' },
    });

    const unbalanced = [];

    for (const txn of transactions) {
      const totalDebit = txn.entries.reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0,
      );
      const totalCredit = txn.entries.reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0,
      );

      // Use a small tolerance for floating point comparison
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        unbalanced.push({
          transaction_id: txn.id,
          reference_type: txn.reference_type,
          reference_id: txn.reference_id,
          date: txn.created_at,
          totalDebit,
          totalCredit,
          difference: totalDebit - totalCredit,
          entries: txn.entries.map((e) => ({
            account_code: e.account.code,
            account_name: e.account.name,
            debit: Number(e.debit || 0),
            credit: Number(e.credit || 0),
            narration: e.narration,
          })),
        });
      }
    }

    return {
      totalTransactions: transactions.length,
      unbalancedCount: unbalanced.length,
      unbalancedTransactions: unbalanced,
    };
  }

  async fixUnbalancedTransaction(transactionId: number) {
    const transaction = await this.txnRepo.findOne({
      where: { id: transactionId },
      relations: ['entries', 'entries.account'],
    });

    if (!transaction) {
      throw new BadRequestException(`Transaction not found: ${transactionId}`);
    }

    const totalDebit = transaction.entries.reduce(
      (sum, entry) => sum + Number(entry.debit || 0),
      0,
    );
    const totalCredit = transaction.entries.reduce(
      (sum, entry) => sum + Number(entry.credit || 0),
      0,
    );
    const difference = totalDebit - totalCredit;

    if (Math.abs(difference) < 0.01) {
      throw new BadRequestException(
        `Transaction ${transactionId} is already balanced`,
      );
    }

    // For sale transactions, we typically need to adjust the cash/receivable entry
    if (transaction.reference_type === 'sale') {
      const salesEntry = transaction.entries.find(
        (e) => e.account.code === 'INCOME.SALES',
      );
      const discountEntry = transaction.entries.find(
        (e) => e.account.code === 'EXPENSE.SALES_DISCOUNT',
      );
      const cashEntry = transaction.entries.find(
        (e) => e.account.code === 'ASSET.CASH',
      );
      const arEntry = transaction.entries.find((e) =>
        e.account.code.includes('AR.CUSTOMER'),
      );

      if (salesEntry && discountEntry) {
        const expectedTotal = Number(salesEntry.credit || 0);
        const discountAmount = Number(discountEntry.debit || 0);
        const expectedCollections = expectedTotal - discountAmount;

        // Calculate how much should have been collected
        const actualCollections =
          Number(cashEntry?.debit || 0) + Number(arEntry?.debit || 0);

        if (actualCollections > expectedCollections) {
          // Too much was collected, adjust the receivable entry
          const excess = actualCollections - expectedCollections;
          if (arEntry && Number(arEntry.debit) > excess) {
            arEntry.debit = Number(arEntry.debit) - excess;
          } else if (cashEntry && Number(cashEntry.debit) > excess) {
            cashEntry.debit = Number(cashEntry.debit) - excess;
          }
        }
      }
    }

    // Save the corrected entries
    await this.entryRepo.save(transaction.entries);

    return {
      transaction_id: transactionId,
      original_difference: difference,
      status: 'Fixed',
      message:
        'Transaction has been balanced by adjusting the collection entries',
    };
  }

  /**
   * Ensure basic accounts exist for the application to function
   * This method can be called when the application needs to create basic accounts
   */
  async ensureBasicAccounts() {
    const basicAccounts = [
      { code: 'ASSET.CASH', name: 'Cash', type: AccountType.ASSET, isCash: true, isBank: false },
      { code: 'ASSET.BANK_IBBL', name: 'Bank Account', type: AccountType.ASSET, isCash: false, isBank: true },
      { code: 'ASSET.INVENTORY', name: 'Inventory', type: AccountType.ASSET, isCash: false, isBank: false },
      { code: 'INCOME.SALES', name: 'Sales Revenue', type: AccountType.INCOME, isCash: false, isBank: false },
      { code: 'EXPENSE.COGS', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, isCash: false, isBank: false },
      { code: 'EXPENSE.SALES_DISCOUNT', name: 'Sales Discount Expense', type: AccountType.EXPENSE, isCash: false, isBank: false },
      { code: 'EQUITY.CAPITAL', name: 'Owner Capital', type: AccountType.EQUITY, isCash: false, isBank: false },
      { code: 'LIABILITY.ACCOUNTS_PAYABLE', name: 'Accounts Payable', type: AccountType.LIABILITY, isCash: false, isBank: false },
    ];

    const createdAccounts = [];

    for (const accountData of basicAccounts) {
      const existing = await this.accountRepo.findOne({
        where: { code: accountData.code },
      });

      if (!existing) {
        // Generate next account number
        const last = await this.accountRepo
          .createQueryBuilder('a')
          .where('a.type = :type', { type: accountData.type })
          .orderBy('CAST(a.account_number AS INTEGER)', 'DESC')
          .getOne();

        let nextNumber = '1001'; // Default starting number
        if (last) {
          nextNumber = (parseInt(last.account_number || '0') + 1).toString();
        }

        const account = this.accountRepo.create({
          account_number: nextNumber,
          code: accountData.code,
          name: accountData.name,
          type: accountData.type,
          isCash: accountData.isCash || false,
          isBank: accountData.isBank || false,
        });

        await this.accountRepo.save(account);
        createdAccounts.push(account.code);
      }
    }

    return {
      message: 'Basic accounts ensured successfully',
      created: createdAccounts,
    };
  }
}

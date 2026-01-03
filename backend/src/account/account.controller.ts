import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AccountType } from 'src/common/enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { AccountService } from './account.service';
import { AddBankBalanceDto } from './dto/add-bank-balance.dto';
import { AddCashDto } from './dto/add-cash.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { FundTransferDto } from './dto/fund-transfer-dto';
import { JournalVoucherDto } from './dto/journal-voucher.dto';
import { OpeningBalanceDto } from './dto/opening-balance.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('Accounts')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}
  @Get('balances')
  @Permissions('account.view')
  @ApiOperation({ summary: 'Get balances for all accounts' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Balances up to this date (defaults to today)',
    example: new Date().toISOString().split('T')[0],
  })
  @ApiQuery({ name: 'isCash', required: false, type: Boolean })
  @ApiQuery({ name: 'isBank', required: false, type: Boolean })
  async getAllBalances(
    @Query('date') date?: string,
    @Query('isCash') isCash?: string,
    @Query('isBank') isBank?: string,
  ) {
    return this.accountService.getAllAccountBalances({
      date,
      isCash: isCash !== undefined ? isCash === 'true' : undefined, // ✔ Fixed
      isBank: isBank !== undefined ? isBank === 'true' : undefined, // ✔ Fixed
    });
  }
  @Post()
  @Permissions('account.create')
  @ApiOperation({ summary: 'Create a new chart-of-account entry' })
  async create(@Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(dto);
  }
  @Get()
  @Permissions('account.view')
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'type', required: false, enum: AccountType })
  @ApiQuery({ name: 'isCash', required: false, type: Boolean })
  @ApiQuery({ name: 'isBank', required: false, type: Boolean })
  async getAllAccounts(
    @Query('type') type?: AccountType,
    @Query('isCash') isCash?: string,
    @Query('isBank') isBank?: string,
  ) {
    return this.accountService.findAllAccounts({
      type,
      isCash: isCash !== undefined ? isCash === 'true' : undefined,
      isBank: isBank !== undefined ? isBank === 'true' : undefined,
    });
  }
  @Get(':id')
  @Permissions('account.view')
  @ApiOperation({ summary: 'Get single account by ID' })
  @ApiParam({ name: 'id', example: 1 })
  async findOne(@Param('id') id: number) {
    return this.accountService.findOneAccount(id);
  }
  @Patch(':id')
  @Permissions('account.update')
  @ApiOperation({ summary: 'Update an existing account' })
  @ApiParam({ name: 'id', example: 1 })
  async update(@Param('id') id: number, @Body() dto: UpdateAccountDto) {
    return this.accountService.updateAccount(id, dto);
  }

  @Delete(':id')
  @Permissions('account.delete')
  @ApiOperation({
    summary: 'Delete account (only if no journal entries exist)',
  })
  @ApiParam({ name: 'id', example: 1 })
  async remove(@Param('id') id: number) {
    return this.accountService.removeAccount(id);
  }

  @Get('balance/:code')
  @Permissions('account.view')
  @ApiOperation({ summary: 'Get balance of a single account' })
  @ApiParam({
    name: 'code',
    example: 'ASSET.CASH',
    description: 'Account code (chart of account)',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Balances up to this date (defaults to today)',
    example: new Date().toISOString().split('T')[0],
  })
  async getBalance(@Param('code') code: string, @Query('date') date?: string) {
    return this.accountService.getAccountBalance(code, date);
  }

  @Post('opening-balance')
  @Permissions('account.create')
  @ApiOperation({ summary: 'Post opening balance for an account' })
  async createOpeningBalance(@Body() dto: OpeningBalanceDto) {
    return this.accountService.createOpeningBalance(dto);
  }

  @Post('add-cash')
  @Permissions('account.create')
  @ApiOperation({
    summary: 'Add cash into the business (capital injection)',
    description: 'Debit: ASSET.CASH, Credit: EQUITY.CAPITAL',
  })
  async addCash(@Body() dto: AddCashDto) {
    return this.accountService.addCash(dto);
  }
  @Post('add-bank-balance')
  @Permissions('account.create')
  @ApiOperation({ summary: 'Add balance to selected bank account' })
  async addBankBalance(@Body() dto: AddBankBalanceDto) {
    return this.accountService.addBankBalance(dto);
  }

  @Post('fund-transfer')
  @Permissions('account.create')
  @ApiOperation({ summary: 'Transfer funds between bank and cash' })
  async transferFunds(@Body() dto: FundTransferDto) {
    return this.accountService.transferFunds(dto);
  }
  @Post('journal-voucher')
  @Permissions('account.create')
  @ApiOperation({
    summary: 'Create a manual Journal Voucher (JV)',
    description:
      'Allows posting of custom debit and credit lines. Must be balanced.',
  })
  async createJournalVoucher(@Body() dto: JournalVoucherDto) {
    return this.accountService.createJournalVoucher(dto);
  }
  @Get('reports/journal')
  @Permissions('account.view')
  @ApiOperation({
    summary: 'Get journal report (all accounting transactions)',
    description:
      'Returns all journal entries including debit, credit, account codes, and narration. Optionally filter by account code or reference type.',
  })
  @ApiQuery({
    name: 'accountCode',
    required: false,
    description: 'Filter transactions by account code (e.g., ASSET.CASH)',
    example: 'ASSET.CASH',
  })
  @ApiQuery({
    name: 'referenceType',
    required: false,
    description: 'Filter transactions by reference type (e.g., supplier_refund, sale, purchase)',
    example: 'supplier_refund',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getJournalReport(
    @Query() paginationDto: PaginationDto & {
      accountCode?: string;
      referenceType?: string;
    },
  ) {
    return this.accountService.getJournalReport(paginationDto);
  }

  @Get('reports/refund-transactions')
  @Permissions('account.view')
  @ApiOperation({
    summary: 'Get refund transaction history',
    description: 'Returns all supplier refund transactions from purchase returns with their details',
  })
  @ApiQuery({
    name: 'accountCode',
    required: false,
    description: 'Filter refund transactions by account code (e.g., ASSET.CASH)',
    example: 'ASSET.CASH',
  })
  async getRefundTransactions(@Query() paginationDto: PaginationDto & {
    accountCode?: string;
  }) {
    return this.accountService.getJournalReport({
      ...paginationDto,
      referenceType: 'supplier_refund',
    });
  }
  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Trial Balance Report' })
  getTrialBalance(@Query('date') date?: string) {
    return this.accountService.getTrialBalance(date);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Balance Sheet Report' })
  getBalanceSheet(@Query('date') date?: string) {
    return this.accountService.getBalanceSheet(date);
  }

  @Get('reports/profit-loss')
  @ApiOperation({ summary: 'Profit & Loss Statement' })
  getProfitLoss(@Query('date') date?: string) {
    return this.accountService.getProfitAndLoss(date);
  }

  @Get('ledger/supplier/:supplierId')
  @ApiOperation({ summary: 'Get Supplier Ledger' })
  getSupplierLedger(
    @Param('supplierId') supplierId: number,
    @Query() paginationDto: PaginationDto,
    @Query('date') date?: string,
  ) {
    return this.accountService.getSupplierLedger(supplierId, paginationDto, date);
  }

  @Get('ledger/customer/:customerId')
  @ApiOperation({ summary: 'Get Customer Ledger' })
  getCustomerLedger(
    @Param('customerId') customerId: number,
    @Query() paginationDto: PaginationDto,
    @Query('date') date?: string,
  ) {
    return this.accountService.getCustomerLedger(customerId, paginationDto, date);
  }

  @Get('ledger/cash-bank/:code')
  @ApiOperation({ summary: 'Get Cash or Bank Ledger' })
  getCashBankLedger(
    @Param('code') code: string,
    @Query() paginationDto: PaginationDto,
    @Query('date') date?: string
  ) {
    return this.accountService.getCashBankLedger(code, paginationDto, date);
  }

  @Get('diagnostic/unbalanced-transactions')
  @ApiOperation({
    summary: 'Diagnostic: Find unbalanced transactions',
    description: 'Returns all transactions where total debit != total credit'
  })
  @Permissions('account.view')
  async findUnbalancedTransactions() {
    return this.accountService.findUnbalancedTransactions();
  }

  @Post('diagnostic/fix-unbalanced-transaction/:transactionId')
  @ApiOperation({
    summary: 'Fix an unbalanced transaction',
    description: 'Automatically balances a transaction by adjusting collection entries'
  })
  @ApiParam({
    name: 'transactionId',
    description: 'ID of the transaction to fix',
    example: 11,
  })
  @Permissions('account.update')
  async fixUnbalancedTransaction(@Param('transactionId') transactionId: number) {
    return this.accountService.fixUnbalancedTransaction(transactionId);
  }

  @Post('setup/basic-accounts')
  @ApiOperation({
    summary: 'Setup basic accounts',
    description: 'Creates essential accounts needed for the application to function (Cash, Bank, Inventory, Sales, COGS, etc.)'
  })
  @Permissions('account.create')
  async setupBasicAccounts() {
    return this.accountService.ensureBasicAccounts();
  }
}

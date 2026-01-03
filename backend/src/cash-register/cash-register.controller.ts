import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CashRegisterService } from './cash-register.service';
import { CashTransactionDto } from './dto/cash-transaction.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CashRegister } from './entities/cash-register.entity';

@ApiTags('Cash Register')
@ApiBearerAuth('token')
@Controller('cash-register')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('create')
  @Permissions('cashregister.create')
  @ApiOperation({ summary: 'Create a new cash register' })
  @ApiQuery({ name: 'name', required: true, description: 'Cash register name' })
  @ApiQuery({
    name: 'branch_id',
    required: true,
    type: Number,
    description: 'Branch ID',
  })
  @ApiQuery({
    name: 'description',
    required: false,
    description: 'Optional description',
  })
  @ApiResponse({
    status: 201,
    description: 'Cash register created successfully',
  })
  async create(
    @Query('name') name: string,
    @Query('branch_id', ParseIntPipe) branch_id: number,
    @Query('description') description?: string,
  ) {
    return await this.cashRegisterService.create(name, branch_id, description);
  }

  @Get()
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get all cash registers' })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cash registers',
    type: [CashRegister],
  })
  async findAll(
    @Query('branch_id', new ParseIntPipe({ optional: true }))
    branch_id?: number,
  ) {
    return await this.cashRegisterService.findAll(branch_id);
  }
  @Get('available')
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get all available/open cash registers' })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by branch ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available cash registers',
    type: [CashRegister],
  })
  async findAvailable(
    @Query('branch_id', new ParseIntPipe({ optional: true }))
    branch_id?: number,
  ) {
    return await this.cashRegisterService.findAvailable(branch_id);
  }

  @Get('transactions')
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get all cash register transactions' })
  @ApiQuery({
    name: 'cashRegisterId',
    required: false,
    type: Number,
    description: 'Filter by specific cash register ID',
  })
  @ApiQuery({
    name: 'transactionType',
    required: false,
    enum: [
      'sale',
      'refund',
      'cash_in',
      'cash_out',
      'opening_balance',
      'closing_balance',
    ],
    description: 'Filter by transaction type',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of all cash register transactions',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 50,
          totalPages: 2,
        },
      },
    },
  })
  async getAllTransactions(
    @Query()
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
  ) {
    return await this.cashRegisterService.getAllTransactions(paginationDto);
  }

  @Get(':id')
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get cash register by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Cash register ID' })
  @ApiResponse({
    status: 200,
    description: 'Cash register details',
    type: CashRegister,
  })
  @ApiResponse({ status: 404, description: 'Cash register not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.cashRegisterService.findOne(id);
  }

  @Post('open')
  @Permissions('cashregister.open')
  @ApiOperation({ summary: 'Open a cash register' })
  @ApiResponse({
    status: 200,
    description: 'Cash register opened successfully',
  })
  @ApiResponse({ status: 400, description: 'Cash register is already open' })
  async openCashRegister(@Body() dto: OpenCashRegisterDto, @Req() req: any) {
    const userId = req.user?.id;
    return await this.cashRegisterService.openCashRegister(dto, userId);
  }

  @Post('close')
  @Permissions('cashregister.close')
  @ApiOperation({ summary: 'Close a cash register' })
  @ApiResponse({
    status: 200,
    description: 'Cash register closed successfully with summary',
  })
  @ApiResponse({ status: 400, description: 'Cash register is not open' })
  async closeCashRegister(@Body() dto: CloseCashRegisterDto, @Req() req: any) {
    const userId = req.user?.id;
    return await this.cashRegisterService.closeCashRegister(dto, userId);
  }

  @Post('transaction')
  @Permissions('cashregister.transaction')
  @ApiOperation({ summary: 'Process cash in/out transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient cash or register not open',
  })
  async processCashTransaction(
    @Body() dto: CashTransactionDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return await this.cashRegisterService.processCashTransaction(dto, userId);
  }

  @Get(':id/transactions')
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get cash register transactions' })
  @ApiParam({ name: 'id', type: Number, description: 'Cash register ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of transactions',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 50,
          totalPages: 2,
        },
      },
    },
  })
  async getTransactions(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.cashRegisterService.getTransactions(id, paginationDto);
  }

  @Get(':id/summary')
  @Permissions('cashregister.view')
  @ApiOperation({ summary: 'Get cash register summary for a date' })
  @ApiParam({ name: 'id', type: Number, description: 'Cash register ID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Date (YYYY-MM-DD), defaults to today',
  })
  @ApiResponse({
    status: 200,
    description: 'Cash register summary',
    schema: {
      example: {
        opening_balance: 10000,
        total_sales: 15000,
        total_refunds: 500,
        cash_in: 2000,
        cash_out: 1000,
        closing_balance: 25500,
        transactions: 25,
      },
    },
  })
  async getRegisterSummary(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : undefined;
    return await this.cashRegisterService.getRegisterSummary(id, targetDate);
  }
}

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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CashRegisterService } from 'src/cash-register/cash-register.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Sale } from 'src/sales/entities/sale.entity';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { PosService } from './pos.service';

@ApiTags('POS')
@ApiBearerAuth('token')
@Controller('pos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PosController {
  constructor(
    private readonly posService: PosService,
    private readonly cashRegisterService: CashRegisterService,
  ) {}

  @Post('sale')
  @Permissions('sale.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Create a new POS sale',
    description:
      'Quick sale creation for POS system. ' +
      'Automatically handles inventory, accounting, and payment processing.',
  })
  @ApiOkResponse({ description: 'Sale created successfully', type: Sale })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createSale(@Body() dto: CreatePosSaleDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.posService.createPosSale(dto, userId);
  }

  @Get('sales')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get all POS sales' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of POS sales',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        },
      },
    },
  })
  async getAllSales(@Query() paginationDto: PaginationDto) {
    return this.posService.findAll(paginationDto);
  }

  @Get('summary/today')
  @Permissions('sale.view')
  @ApiOperation({
    summary: "Get today's sales summary",
    description:
      'Returns sales statistics for the current day including revenue and payment breakdowns',
  })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by specific branch',
  })
  @ApiResponse({
    status: 200,
    description: "Today's sales summary",
    schema: {
      example: {
        date: '2025-11-29',
        total_sales: 50,
        total_revenue: 500000,
        payment_breakdown: {
          cash: 300000,
          card: 150000,
          mobile: 50000,
        },
      },
    },
  })
  async getTodaySummary(
    @Query('branch_id', new ParseIntPipe({ optional: true }))
    branch_id?: number,
  ) {
    return this.posService.getTodaySummary(branch_id);
  }

  @Get('sale/:id')
  @Permissions('sale.view')
  @ApiOperation({ summary: 'Get POS sale details by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 1 })
  @ApiOkResponse({
    description: 'Sale details retrieved successfully',
    type: Sale,
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async getSale(@Param('id', ParseIntPipe) id: number) {
    return this.posService.findOne(id);
  }

  @Get('transactions/history')
  @Permissions('sale.view')
  @ApiOperation({
    summary: 'Get transaction history for POS sales',
    description:
      'Returns accounting transaction history for POS sales with filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by branch',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history list',
    schema: {
      example: {
        data: [
          {
            sale_id: 1,
            invoice_no: 'INV-20251129-0001',
            branch: { id: 1, name: 'Main Branch' },
            customer: null,
            served_by: { id: 1, name: 'John Doe' },
            total: 1500,
            created_at: '2025-11-29T10:00:00.000Z',
            transactions: [
              {
                id: 1,
                reference_type: 'sale',
                reference_id: 1,
                created_at: '2025-11-29T10:00:00.000Z',
                entries: [
                  {
                    account_code: 'ASSET.CASH',
                    account_name: 'Cash',
                    debit: 1500,
                    credit: 0,
                    narration: 'Payment Received for sale 1 (cash)',
                  },
                  {
                    account_code: 'INCOME.SALES',
                    account_name: 'Sales Revenue',
                    debit: 0,
                    credit: 1500,
                    narration: 'Sales revenue for INV-20251129-0001',
                  },
                ],
              },
            ],
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        },
      },
    },
  })
  async getTransactionHistory(
    @Query() paginationDto: PaginationDto,
    @Query('branch_id', new ParseIntPipe({ optional: true }))
    branch_id?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.posService.getTransactionHistoryList(
      paginationDto,
      branch_id,
      startDate,
      endDate,
    );
  }

  @Get('sale/:id/transactions')
  @Permissions('sale.view')
  @ApiOperation({
    summary: 'Get transaction history for a specific POS sale',
    description:
      'Returns all accounting transactions related to a specific sale',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Sale ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Transaction history for the sale',
    schema: {
      example: [
        {
          id: 1,
          reference_type: 'sale',
          reference_id: 1,
          created_at: '2025-11-29T10:00:00.000Z',
          entries: [
            {
              account_code: 'ASSET.CASH',
              account_name: 'Cash',
              debit: 1500,
              credit: 0,
              narration: 'Payment for sale 1 (cash)',
            },
            {
              account_code: 'INCOME.SALES',
              account_name: 'Sales Revenue',
              debit: 0,
              credit: 1500,
              narration: 'Sales revenue for INV-20251129-0001',
            },
          ],
        },
      ],
    },
  })
  async getSaleTransactions(@Param('id', ParseIntPipe) id: number) {
    return this.posService.getTransactionHistory(id);
  }

  @Get('cash-registers')
  @Permissions('sale.view')
  @ApiOperation({
    summary: 'Get available cash registers for POS',
    description:
      'Returns list of cash registers that can be used for POS sales',
  })
  @ApiQuery({
    name: 'branch_id',
    required: false,
    type: Number,
    description: 'Filter by branch ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'closed'],
    description: 'Filter by status (open or closed)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cash registers',
    schema: {
      example: [
        {
          id: 1,
          name: 'Main Counter',
          description: 'Front desk cash register',
          status: 'open',
          current_balance: 15000,
          opening_balance: 10000,
          opened_by: { id: 1, username: 'cashier1' },
          opened_at: '2025-12-11T09:00:00.000Z',
          branch: { id: 1, name: 'Main Branch' },
        },
      ],
    },
  })
  async getCashRegisters(
    @Query('branch_id', new ParseIntPipe({ optional: true }))
    branch_id?: number,
    @Query('status') status?: 'open' | 'closed',
  ) {
    const cashRegisters = await this.cashRegisterService.findAll(branch_id);

    // Filter by status if provided
    let filteredRegisters = cashRegisters;
    if (status) {
      filteredRegisters = cashRegisters.filter((cr) => cr.status === status);
    }

    // Return only the fields needed for POS
    return filteredRegisters.map((cr) => ({
      id: cr.id,
      name: cr.name,
      description: cr.description,
      status: cr.status,
      current_balance: cr.current_balance,
      opening_balance: cr.opening_balance,
      opened_by: cr.opened_by,
      opened_at: cr.opened_at,
      branch: cr.branch,
    }));
  }
}

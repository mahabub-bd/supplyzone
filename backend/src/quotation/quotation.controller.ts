import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Sale } from 'src/sales/entities/sale.entity';
import { ConvertToSaleDto } from './dto/convert-to-sale.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { Quotation } from './entities/quotation.entity';
import { QuotationService } from './quotation.service';

@ApiTags('Quotations')
@ApiBearerAuth('token')
@Controller('quotations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  @Permissions('quotation.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiOkResponse({
    description: 'Quotation created successfully',
    type: Quotation,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateQuotationDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.quotationService.create(dto, userId);
  }

  @Get('list')
  @Permissions('quotation.view')
  @ApiOperation({ summary: 'Get Quotation List' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
    description: 'Filter by quotation status',
  })
  @ApiQuery({
    name: 'customer_id',
    required: false,
    type: Number,
    description: 'Filter by customer ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of quotations',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  async getAll(
    @Query()
    paginationDto: PaginationDto & {
      status?: string;
      customer_id?: number;
    },
  ) {
    return this.quotationService.findAll(paginationDto);
  }

  @Get('analytics/last-30-days')
  @Permissions('quotation.view')
  @ApiOperation({ summary: 'Get quotations data for the last 30 days' })
  @ApiResponse({
    status: 200,
    description: 'Last 30 days quotations data',
    schema: {
      example: {
        totalQuotations: 45,
        totalAmount: 150000,
        averageQuotationValue: 3333.33,
        conversionRate: 65.5,
        statusBreakdown: {
          draft: 5,
          sent: 15,
          accepted: 20,
          rejected: 3,
          expired: 2,
          converted: 0,
        },
        dailyQuotations: [
          { date: '2025-12-03', total: 5000, count: 3 },
          { date: '2025-12-02', total: 4500, count: 2 },
        ],
      },
    },
  })
  async getLast30DaysQuotations() {
    return this.quotationService.getQuotationsAnalytics();
  }

  @Get('customer/:customerId')
  @Permissions('quotation.view')
  @ApiOperation({ summary: 'Get quotations by customer ID' })
  @ApiParam({ name: 'customerId', type: Number, description: 'Customer ID' })
  @ApiOkResponse({
    description: 'Customer quotations retrieved successfully',
    type: [Quotation],
  })
  async getQuotationsByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.quotationService.getQuotationsByCustomer(customerId);
  }

  @Get('expired')
  @Permissions('quotation.view')
  @ApiOperation({ summary: 'Get expired quotations' })
  @ApiOkResponse({
    description: 'Expired quotations retrieved successfully',
    type: [Quotation],
  })
  async getExpiredQuotations() {
    return this.quotationService.getExpiredQuotations();
  }

  @Get(':id')
  @Permissions('quotation.view')
  @ApiOperation({ summary: 'Get quotation details by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Quotation ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Quotation details retrieved successfully',
    type: Quotation,
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  @Permissions('quotation.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update a quotation' })
  @ApiParam({ name: 'id', type: Number, description: 'Quotation ID' })
  @ApiOkResponse({
    description: 'Quotation updated successfully',
    type: Quotation,
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update quotation in current status',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuotationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.quotationService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @Permissions('quotation.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update quotation status' })
  @ApiParam({ name: 'id', type: Number, description: 'Quotation ID' })
  @ApiOkResponse({
    description: 'Quotation status updated successfully',
    type: Quotation,
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuotationStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.quotationService.updateStatus(id, dto, userId);
  }

  @Post(':id/convert-to-sale')
  @Permissions('quotation.convert', 'sale.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Convert quotation to sale' })
  @ApiParam({ name: 'id', type: Number, description: 'Quotation ID' })
  @ApiOkResponse({
    description: 'Quotation converted to sale successfully',
    type: Sale,
    schema: {
      example: {
        id: 1,
        invoice_no: 'INV-2025-0001',
        subtotal: 1000,
        discount: 0,
        tax: 150,
        total: 1150,
        paid_amount: 1150,
        status: 'completed',
        items: [],
        payments: [],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot convert quotation in current status',
  })
  async convertToSale(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConvertToSaleDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.quotationService.convertToSale(id, dto, userId);
  }

  @Delete(':id')
  @Permissions('quotation.delete')
  @ApiOperation({ summary: 'Delete a quotation' })
  @ApiParam({ name: 'id', type: Number, description: 'Quotation ID' })
  @ApiOkResponse({ description: 'Quotation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete quotation in current status',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    await this.quotationService.remove(id, userId);
    return { message: 'Quotation deleted successfully' };
  }
}

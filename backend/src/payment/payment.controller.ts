import {
  Body,
  Controller,
  Get,
  Param,
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
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @Permissions('payment.create')
  @ApiOperation({
    summary: 'Create a new payment',
    description:
      'Handles supplier payment against a purchase or customer payment against a sale. ' +
      'Automatically updates payable/receivable and posts the accounting transaction. ' +
      'Example payloads:\n\n' +
      'Supplier Payment:\n' +
      `{
  "type": "supplier",
  "supplier_id": 20,
  "purchase_id": 6,
  "amount": 150000,
  "method": "cash",
  "note": "Partial payment"
}\n\n` +
      'Customer Payment:\n' +
      `{
  "type": "customer",
  "customer_id": 15,
  "sale_id": 8,
  "amount": 5000,
  "method": "bank",
  "payment_account_code": "ASSET.BANK_IBBL",
  "note": "Payment for due sale"
}`,
  })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get()
  @Permissions('payment.view')
  @ApiOperation({
    summary: 'Retrieve all payments with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'supplier',
    description: 'Filter by payment type (supplier/customer)',
  })
  @ApiQuery({
    name: 'method',
    required: false,
    example: 'cash',
    description: 'Filter by payment method (cash/bank)',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('method') method?: string,
  ) {
    return this.paymentService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      type,
      method,
    });
  }

  @Get(':id')
  @Permissions('payment.view')
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'Unique ID of the payment record',
  })
  async findOne(@Param('id') id: number) {
    return this.paymentService.findOne(id);
  }
}

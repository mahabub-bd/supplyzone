import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { ProcessPurchaseReturnDto } from './dto/process-purchase-return.dto';
import { RefundPurchaseReturnDto } from './dto/refund-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { PurchaseReturnService } from './purchase-return.service';
import { ApprovePurchaseReturnDto } from './dto/approve-purchase-return.dto';

@ApiTags('Purchase Return')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('purchase-returns')
export class PurchaseReturnController {
  constructor(private purchaseReturnService: PurchaseReturnService) {}

  @Post()
  @Permissions('purchase_return.create')
  @ApiOperation({
    summary: 'Create a new purchase return',
    description: 'Create a new purchase return with items and calculate totals',
  })
  @ApiResponse({
    status: 201,
    description: 'Purchase return created successfully',
    type: PurchaseReturn,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or insufficient inventory',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase, Supplier, or Warehouse not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(@Body() dto: CreatePurchaseReturnDto) {
    return this.purchaseReturnService.create(dto);
  }

  @Get()
  @Permissions('purchase_return.view')
  @ApiOperation({
    summary: 'Get all purchase returns',
    description: 'Retrieve a list of all purchase returns with their items',
  })
  @ApiResponse({
    status: 200,
    description: 'List of purchase returns retrieved successfully',
    type: [PurchaseReturn],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  findAll() {
    return this.purchaseReturnService.findAll();
  }

  @Get(':id')
  @Permissions('purchase_return.view')
  @ApiOperation({
    summary: 'Get purchase return by ID',
    description: 'Retrieve a single purchase return with all details',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase return retrieved successfully',
    type: PurchaseReturn,
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  findOne(@Param('id') id: number) {
    return this.purchaseReturnService.findOne(id);
  }

  @Patch(':id')
  @Permissions('purchase_return.update')
  @ApiOperation({
    summary: 'Update purchase return',
    description:
      'Update details of an existing purchase return (only draft status)',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase return updated successfully',
    type: PurchaseReturn,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot update non-draft returns',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async update(@Param('id') id: number, @Body() dto: UpdatePurchaseReturnDto) {
    return await this.purchaseReturnService.update(id, dto);
  }

  @Patch(':id/approve')
  @Permissions('purchase_return.approve')
  @ApiOperation({
    summary: 'Approve purchase return',
    description: 'Approve a draft purchase return for processing',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase return approved successfully',
    type: PurchaseReturn,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot approve non-draft returns',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async approveReturn(
    @Param('id') id: number,
    @Body() dto: ApprovePurchaseReturnDto,
    @Request() req: any,
  ) {
    return await this.purchaseReturnService.approveReturn(
      id,
      dto,
      req.user?.id,
    );
  }

  @Patch(':id/process')
  @Permissions('purchase_return.process')
  @ApiOperation({
    summary: 'Process purchase return',
    description: 'Process approved purchase return and update inventory',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase return processed and inventory updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        return_id: { type: 'number' },
        total_amount: { type: 'number' },
        supplier_account: { type: 'string' },
        inventory_account: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Cannot process non-approved returns or insufficient inventory',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  processReturn(
    @Param('id') id: number,
    @Body() dto: ProcessPurchaseReturnDto,
    @Request() req: any,
  ) {
    return this.purchaseReturnService.processReturn(id, dto, req.user?.id);
  }

  @Patch(':id/cancel')
  @Permissions('purchase_return.delete')
  @ApiOperation({
    summary: 'Cancel purchase return',
    description:
      'Cancel a purchase return (cannot cancel if already processed)',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase return cancelled successfully',
    type: PurchaseReturn,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot cancel processed returns',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async cancelReturn(@Param('id') id: number, @Request() req: any) {
    return await this.purchaseReturnService.cancelReturn(id, req.user?.id);
  }

  @Patch(':id/refund')
  @Permissions('purchase_return.refund')
  @ApiOperation({
    summary: 'Process refund for purchase return',
    description:
      'Process refund for a processed purchase return that was marked for refund later',
  })
  @ApiParam({
    name: 'id',
    description: 'Purchase Return ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        return_id: { type: 'number' },
        refund_amount: { type: 'number' },
        debit_account: { type: 'string' },
        supplier_account: { type: 'string' },
        payment_method: { type: 'string' },
        reference: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Cannot refund non-processed returns or already refunded',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase return not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async processRefund(
    @Param('id') id: number,
    @Body() dto: RefundPurchaseReturnDto,
    @Request() req: any,
  ) {
    return await this.purchaseReturnService.processRefund(
      id,
      dto,
      req.user?.id,
    );
  }
}

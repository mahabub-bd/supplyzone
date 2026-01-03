import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateSaleReturnDto } from './dto/create-sale-return.dto';
import { ProcessSaleReturnDto } from './dto/process-sale-return.dto';
import { UpdateSaleReturnDto } from './dto/update-sale-return.dto';
import { SaleReturn } from './entities/sale-return.entity';
import { SaleReturnService } from './sale-return.service';

@ApiTags('Sale Return')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sale-returns')
export class SaleReturnController {
  constructor(private readonly saleReturnService: SaleReturnService) {}

  @Post()
  @Permissions('sale_return.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new sale return' })
  @ApiOkResponse({ description: 'Sale return created successfully', type: SaleReturn })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateSaleReturnDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.saleReturnService.create(dto, userId);
  }

  @Get()
  @Permissions('sale_return.view')
  @ApiOperation({ summary: 'Get all sale returns' })
  @ApiOkResponse({ description: 'List of sale returns retrieved successfully', type: [SaleReturn] })
  async findAll() {
    return this.saleReturnService.findAll();
  }

  @Get(':id')
  @Permissions('sale_return.view')
  @ApiOperation({ summary: 'Get sale return by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale Return ID', example: 1 })
  @ApiOkResponse({ description: 'Sale return details retrieved successfully', type: SaleReturn })
  @ApiResponse({ status: 404, description: 'Sale return not found' })
  async findOne(@Param('id') id: number) {
    return this.saleReturnService.findOne(id);
  }

  @Patch(':id')
  @Permissions('sale_return.update')
  @ApiOperation({ summary: 'Update sale return' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale Return ID', example: 1 })
  @ApiOkResponse({ description: 'Sale return updated successfully', type: SaleReturn })
  @ApiResponse({ status: 400, description: 'Cannot update non-draft returns' })
  async update(@Param('id') id: number, @Body() dto: UpdateSaleReturnDto) {
    return this.saleReturnService.update(id, dto);
  }

  @Patch(':id/approve')
  @Permissions('sale_return.approve')
  @ApiOperation({ summary: 'Approve sale return' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale Return ID', example: 1 })
  @ApiOkResponse({ description: 'Sale return approved successfully', type: SaleReturn })
  @ApiResponse({ status: 400, description: 'Cannot approve non-draft returns' })
  async approveReturn(@Param('id') id: number) {
    return this.saleReturnService.approveReturn(id);
  }

  @Patch(':id/process')
  @Permissions('sale_return.process')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Process sale return refund' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale Return ID', example: 1 })
  @ApiOkResponse({
    description: 'Sale return processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        return_id: { type: 'number' },
        refund_amount: { type: 'number' },
        remaining_amount: { type: 'number' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cannot process non-approved returns' })
  async processReturn(@Param('id') id: number, @Body() dto: ProcessSaleReturnDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.saleReturnService.processReturn(id, dto, userId);
  }

  @Patch(':id/cancel')
  @Permissions('sale_return.delete')
  @ApiOperation({ summary: 'Cancel sale return' })
  @ApiParam({ name: 'id', type: Number, description: 'Sale Return ID', example: 1 })
  @ApiOkResponse({ description: 'Sale return cancelled successfully', type: SaleReturn })
  @ApiResponse({ status: 400, description: 'Cannot cancel processed returns' })
  async cancelReturn(@Param('id') id: number) {
    return this.saleReturnService.cancelReturn(id);
  }
}
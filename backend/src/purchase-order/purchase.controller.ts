import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Purchase } from './entities/purchase.entity';
import { PurchaseOrderStatus } from './enums/purchase-order-status.enum';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchase')
@ApiBearerAuth('token')
@Controller('purchase')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @Permissions('purchase.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiCreatedResponse({
    description: 'Purchase created successfully',
    type: Purchase,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.purchaseService.create(createPurchaseOrderDto, userId);
  }

  @Get()
  @Permissions('purchase.view')
  @ApiOperation({ summary: 'Get list of all purchases' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PurchaseOrderStatus })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiOkResponse({ description: 'List of purchases retrieved successfully' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: PurchaseOrderStatus,
    @Query('supplierId') supplierId?: number,
  ) {
    return this.purchaseService.findAll(page, limit, status, supplierId);
  }

  @Get(':id')
  @Permissions('purchase.view')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiOkResponse({
    description: 'Purchase retrieved successfully',
    type: Purchase,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @Permissions('purchase.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update a purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiOkResponse({
    description: 'Purchase updated successfully',
    type: Purchase,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseService.update(id, updatePurchaseOrderDto);
  }

  @Patch(':id/status')
  @Permissions('purchase.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update purchase status' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiOkResponse({
    description: 'Purchase status updated successfully',
    type: Purchase,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdatePurchaseOrderStatusDto,
  ) {
    return this.purchaseService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/receive')
  @Permissions('purchase.receive')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Receive items for a purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiOkResponse({ description: 'Items received successfully', type: Purchase })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async receiveItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() receiveItemsDto: ReceiveItemsDto,
  ) {
    return this.purchaseService.receiveItems(id, receiveItemsDto);
  }

  @Delete(':id')
  @Permissions('purchase.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a purchase' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiResponse({ status: 204, description: 'Purchase deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.purchaseService.remove(id);
  }
}

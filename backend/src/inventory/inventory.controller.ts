import {
  Body,
  Controller,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { TransferStockDto } from './dto/transfet-stock.dto';
import { StockMovementType } from './entities/stock-movement.entity';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private svc: InventoryService) {}

  @Post()
  @Permissions('inventory.add')
  @ApiOperation({ summary: 'Add new stock entry to inventory' })
  @ApiResponse({
    status: 201,
    description: 'Stock added successfully',
    schema: {
      example: {
        id: 1,
        product_id: 12,
        warehouse_id: 3,
        quantity: 100,
        purchase_price: 1200.5,
        created_at: '2025-01-22T10:25:30.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  addStock(@Body() dto: CreateInventoryDto) {
    return this.svc.addStock(dto);
  }

  @Patch(':id/adjust')
  @Permissions('inventory.adjust')
  @ApiOperation({ summary: 'Adjust stock quantity for a specific inventory batch. ID can be numeric (inventory ID) or composite (productId-warehouseId)' })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
    schema: {
      example: {
        id: 1,
        quantity: 80,
        updated_at: '2025-01-22T12:45:30.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.svc.adjustStock(id, dto);
  }
  @Get('report/product-wise')
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get product-wise stock summary across all warehouses' })
  @ApiQuery({ name: 'product_type', required: false, description: 'Filter by product type (supports comma-separated values: raw_material, component, finished_good, resale, consumable, packaging, service)' })
  @ApiResponse({
    status: 200,
    description: 'Returns stock grouped by product',
    schema: {
      example: [
        {
          product_id: 1,
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO' },
          total_stock: 150,
          total_sold_quantity: 50,
          remaining_stock: 100,
          purchase_value: 120000,
          sale_value: 150000,
          warehouses: [
            {
              id: 1,
              warehouse_id: 1,
              warehouse: { id: 1, name: 'Main Warehouse' },
              purchased_quantity: 100,
              sold_quantity: 30,
              remaining_quantity: 70,
              batch_no: 'BATCH-001',
              purchase_value: 84000,
              sale_value: 105000,
            },
          ],
        },
      ],
    },
  })
  getProductWise(@Query('product_type') product_type?: string) {
    return this.svc.getProductWiseStock(product_type);
  }

  @Get('report/warehouse-wise')
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get warehouse-wise stock summary with product list' })
  @ApiQuery({ name: 'warehouse_id', required: false, description: 'Filter by specific warehouse ID', example: 1 })
  @ApiQuery({ name: 'search', required: false, description: 'Search products by name or SKU', example: 'iPhone' })
  @ApiResponse({
    status: 200,
    description: 'Returns stock grouped by warehouse with all products',
    schema: {
      example: [
        {
          warehouse_id: 1,
          warehouse: { id: 1, name: 'Main Warehouse', location: 'Dhaka' },
          total_stock: 500,
          total_sold_quantity: 150,
          remaining_stock: 350,
          purchase_value: 420000,
          sale_value: 525000,
          products: [
            {
              product: {
                id: 1,
                name: 'iPhone 15 Pro',
                sku: 'IPH-15-PRO',
                selling_price: 1500,
              },
              purchased_quantity: 100,
              sold_quantity: 30,
              remaining_quantity: 70,
              batch_no: 'BATCH-001',
              purchase_value: 84000,
              sale_value: 105000,
            },
          ],
        },
      ],
    },
  })
  getWarehouseWise(
    @Query('warehouse_id') warehouseId?: number,
    @Query('search') search?: string,
  ) {
    return this.svc.getWarehouseWiseStock(warehouseId ? Number(warehouseId) : undefined, search);
  }

  @Get()
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get all inventory batches' })
  @ApiResponse({
    status: 200,
    description: 'Returns all inventory entries',
    schema: {
      example: [
        {
          id: 1,
          product: { id: 12, name: 'iPhone 15 Pro' },
          warehouse: { id: 3, name: 'Main Warehouse' },
          quantity: 100,
          purchase_price: 1200.5,
          created_at: '2025-01-22T10:25:30.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.svc.findAll();
  }

  @Post('transfer')
  @Permissions('inventory.transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Stock transferred successfully',
    schema: {
      example: {
        message: 'Stock transferred successfully',
        transferred_quantity: 20,
        from: 1,
        to: 2,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  @ApiResponse({ status: 404, description: 'Source inventory not found' })
  transfer(@Body() dto: TransferStockDto) {
    return this.svc.transferStock(dto);
  }

  @Get('product/:id')
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get inventory batches for a specific product' })
  @ApiResponse({
    status: 200,
    description: 'Returns stock data by product ID',
    schema: {
      example: [
        {
          id: 1,
          warehouse: { id: 3, name: 'Main Warehouse' },
          quantity: 80,
          purchase_price: 1200.5,
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductStock(@Param('id') id: string) {
    return this.svc.getProductStock(+id);
  }

  @Get('movements')
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get stock movement history with optional filters' })
  @ApiQuery({ name: 'product_id', required: false, description: 'Filter by product ID', example: 1 })
  @ApiQuery({ name: 'warehouse_id', required: false, description: 'Filter by warehouse ID', example: 1 })
  @ApiQuery({ name: 'type', required: false, enum: StockMovementType, description: 'Filter by movement type (IN, OUT, ADJUST, TRANSFER)' })
  @ApiResponse({
    status: 200,
    description: 'Returns stock movement history',
    schema: {
      example: [
        {
          id: 1,
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO' },
          warehouse: { id: 1, name: 'Main Warehouse' },
          type: 'TRANSFER',
          quantity: 10,
          note: 'Transferred 10 units',
          from_warehouse: { id: 1, name: 'Main Warehouse' },
          to_warehouse: { id: 2, name: 'Badda Warehouse' },
          created_by: { id: 1, name: 'Admin User' },
          created_at: '2025-12-18T10:30:00.000Z',
        },
        {
          id: 2,
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO' },
          warehouse: { id: 1, name: 'Main Warehouse' },
          type: 'ADJUST',
          quantity: -5,
          note: 'Stock adjustment - damaged items',
          created_at: '2025-12-17T14:20:00.000Z',
        },
      ],
    },
  })
  getStockMovements(
    @Query('product_id') productId?: number,
    @Query('warehouse_id') warehouseId?: number,
    @Query('type') type?: StockMovementType,
  ) {
    return this.svc.getStockMovements(
      productId ? Number(productId) : undefined,
      warehouseId ? Number(warehouseId) : undefined,
      type,
    );
  }

  @Get('journal')
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get inventory journal with running balance (ledger-style)' })
  @ApiQuery({ name: 'product_id', required: false, description: 'Filter by product ID', example: 1 })
  @ApiQuery({ name: 'warehouse_id', required: false, description: 'Filter by warehouse ID', example: 1 })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter by start date (YYYY-MM-DD)', example: '2025-01-01' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter by end date (YYYY-MM-DD)', example: '2025-12-31' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order', example: 'desc', enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Returns inventory journal entries with running balance',
    schema: {
      example: [
        {
          id: 1,
          date: '2025-12-01T10:00:00.000Z',
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO', image: 'https://example.com/image.jpg' },
          warehouse: { id: 1, name: 'Main Warehouse' },
          type: 'IN',
          description: 'Stock received',
          reference: null,
          debit: 100,
          credit: 0,
          balance: 100,
          created_by: { id: 1, name: 'Admin User' },
        },
        {
          id: 2,
          date: '2025-12-05T14:30:00.000Z',
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO', image: 'https://example.com/image.jpg' },
          warehouse: { id: 1, name: 'Main Warehouse' },
          type: 'OUT',
          description: 'Stock sold',
          reference: null,
          debit: 0,
          credit: 30,
          balance: 70,
          created_by: null,
        },
        {
          id: 3,
          date: '2025-12-10T09:15:00.000Z',
          product: { id: 1, name: 'iPhone 15 Pro', sku: 'IPH-15-PRO', image: 'https://example.com/image.jpg' },
          warehouse: { id: 1, name: 'Main Warehouse' },
          type: 'TRANSFER',
          description: 'Transferred to Badda Warehouse',
          reference: 'From: Main Warehouse → To: Badda Warehouse',
          debit: 0,
          credit: 20,
          balance: 50,
          created_by: { id: 1, name: 'Admin User' },
        },
      ],
    },
  })
  getInventoryJournal(
    @Query('product_id') productId?: number,
    @Query('warehouse_id') warehouseId?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.svc.getInventoryJournal(
      productId ? Number(productId) : undefined,
      warehouseId ? Number(warehouseId) : undefined,
      startDate,
      endDate,
      sort || 'desc', // Default to descending
    );
  }
}

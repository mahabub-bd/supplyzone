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
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { ProductionQueryDto } from './dto/production-query.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { ProductionService } from './production.service';

@ApiTags('Production')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @Permissions('production.create')
  @ApiOperation({ summary: 'Create a new production order' })
  @ApiResponse({
    status: 201,
    description: 'Production order created successfully',
    schema: {
      example: {
        id: 1,
        order_number: 'PO-2025-001',
        title: 'Samsung Galaxy S24 Production Batch',
        description: 'Production of 1000 units of Samsung Galaxy S24',
        manufacturer: {
          id: 1,
          name: 'Samsung Electronics',
        },
        warehouse: {
          id: 2,
          name: 'Main Warehouse',
        },
        status: 'pending',
        priority: 'normal',
        planned_start_date: '2025-01-25T09:00:00.000Z',
        planned_completion_date: '2025-02-05T18:00:00.000Z',
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: 'Samsung Galaxy S24',
              sku: 'SAM-S24-256GB',
            },
            planned_quantity: 1000,
            estimated_cost: 450500.0,
            status: 'pending',
          },
        ],
        summary: {
          total_planned_quantity: 1000,
          total_estimated_cost: 450500.0,
          total_actual_quantity: 0,
          total_good_quantity: 0,
          total_defective_quantity: 0,
          total_actual_cost: 0,
        },
        created_at: '2025-01-22T10:00:00.000Z',
        updated_at: '2025-01-22T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  create(
    @Body() createProductionOrderDto: CreateProductionOrderDto,
    @Request() req,
  ) {
    return this.productionService.create(createProductionOrderDto, req.user.id);
  }

  @Get()
  @Permissions('production.view')
  @ApiOperation({
    summary: 'Get all production orders with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of production orders',
    schema: {
      example: {
        data: [
          {
            id: 1,
            order_number: 'PO-2025-001',
            title: 'Samsung Galaxy S24 Production Batch',
            manufacturer: {
              id: 1,
              name: 'Samsung Electronics',
            },
            warehouse: {
              id: 2,
              name: 'Main Warehouse',
            },
            status: 'in_progress',
            priority: 'high',
            items: [
              {
                id: 1,
                product: {
                  id: 1,
                  name: 'Samsung Galaxy S24',
                  sku: 'SAM-S24-256GB',
                },
                planned_quantity: 1000,
                actual_quantity: 750,
                good_quantity: 720,
                defective_quantity: 30,
                status: 'in_progress',
              },
            ],
            created_at: '2025-01-22T10:00:00.000Z',
            updated_at: '2025-01-25T14:30:00.000Z',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  findAll(@Query() query: ProductionQueryDto) {
    console.log(query);

    return this.productionService.findAll(query);
  }

  @Get('stats')
  @Permissions('production.view')
  @ApiOperation({ summary: 'Get production order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns production order statistics',
    schema: {
      example: {
        totalOrders: 25,
        pendingOrders: 8,
        inProgressOrders: 5,
        completedOrders: 10,
        cancelledOrders: 2,
        onHoldOrders: 0,
      },
    },
  })
  getStats() {
    return this.productionService.getProductionStats();
  }

  @Get(':id/logs')
  @Permissions('production.view')
  @ApiOperation({ summary: 'Get production order logs/activities' })
  @ApiResponse({
    status: 200,
    description: 'Returns production order activity logs',
    schema: {
      example: [
        {
          id: 1,
          log_type: 'order_created',
          message: 'Production order PO-2025-001 created with 1 items',
          metadata: {
            items_count: 1,
          },
          user: {
            id: 1,
            name: 'John Doe',
          },
          created_at: '2025-01-22T10:00:00.000Z',
        },
        {
          id: 2,
          log_type: 'status_changed',
          message: 'Status changed from pending to in_progress',
          user: {
            id: 2,
            name: 'Jane Smith',
          },
          created_at: '2025-01-26T08:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Production order not found' })
  getLogs(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.getProductionLogs(id);
  }

  @Get(':id')
  @Permissions('production.view')
  @ApiOperation({ summary: 'Get production order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns production order details with summary',
    schema: {
      example: {
        id: 1,
        order_number: 'PO-2025-001',
        title: 'Samsung Galaxy S24 Production Batch',
        description: 'Production of 1000 units of Samsung Galaxy S24',
        manufacturer: {
          id: 1,
          name: 'Samsung Electronics',
        },
        warehouse: {
          id: 2,
          name: 'Main Warehouse',
        },
        status: 'completed',
        priority: 'normal',
        planned_start_date: '2025-01-25T09:00:00.000Z',
        actual_start_date: '2025-01-26T08:30:00.000Z',
        planned_completion_date: '2025-02-05T18:00:00.000Z',
        actual_completion_date: '2025-02-04T16:45:00.000Z',
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: 'Samsung Galaxy S24',
              sku: 'SAM-S24-256GB',
            },
            planned_quantity: 1000,
            actual_quantity: 1000,
            good_quantity: 980,
            defective_quantity: 20,
            unit_cost: 450.5,
            estimated_cost: 450500.0,
            actual_cost: 438200.0,
            batch_number: 'BATCH-S24-2025-001',
            status: 'completed',
          },
        ],
        summary: {
          total_planned_quantity: 1000,
          total_actual_quantity: 1000,
          total_good_quantity: 980,
          total_defective_quantity: 20,
          total_estimated_cost: 450500.0,
          total_actual_cost: 438200.0,
          cost_variance: -12200.0,
          yield_percentage: 98.0,
          efficiency_score: 95.2,
        },
        created_at: '2025-01-22T10:00:00.000Z',
        updated_at: '2025-01-26T16:45:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.findOne(id);
  }

  @Patch(':id')
  @Permissions('production.edit')
  @ApiOperation({ summary: 'Update production order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Production order updated successfully',
    schema: {
      example: {
        id: 1,
        order_number: 'PO-2025-001',
        title: 'Updated Samsung Galaxy S24 Production Batch',
        status: 'in_progress',
        items: [
          {
            id: 1,
            planned_quantity: 1200,
            actual_quantity: 800,
            good_quantity: 780,
            defective_quantity: 20,
            status: 'in_progress',
          },
        ],
        summary: {
          total_planned_quantity: 1200,
          total_actual_quantity: 800,
          total_good_quantity: 780,
          total_defective_quantity: 20,
          total_estimated_cost: 540600.0,
          total_actual_cost: 360400.0,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production order not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductionOrderDto: UpdateProductionOrderDto,
    @Request() req,
  ) {
    return this.productionService.update(
      id,
      updateProductionOrderDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @Permissions('production.delete')
  @ApiOperation({ summary: 'Delete production order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Production order deleted successfully',
    schema: {
      example: {
        message: 'Production order deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production order not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete production order that is in progress',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productionService.remove(id, req.user.id);
  }
}

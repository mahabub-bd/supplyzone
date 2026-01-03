import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateProductionRecipeDto } from './dto/create-production-recipe.dto';
import { MaterialConsumptionQueryDto } from './dto/material-consumption.dto';
import { UpdateProductionRecipeDto } from './dto/update-production-recipe.dto';
import { ProductionRecipeService } from './production-recipe.service';

@ApiTags('Production Recipe')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('production-recipe')
export class ProductionRecipeController {
  constructor(
    private readonly productionRecipeService: ProductionRecipeService,
  ) {}

  @Post()
  @Permissions('production.create')
  @ApiOperation({ summary: 'Create a new production recipe' })
  @ApiResponse({
    status: 201,
    description: 'Production recipe created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Samsung Galaxy S24 Manufacturing Recipe',
        recipe_code: 'RECIPE-SG-S24-001',
        finished_product: {
          id: 1,
          name: 'Samsung Galaxy S24',
          sku: 'SAM-S24-256GB',
        },
        description: 'Complete manufacturing process for Samsung Galaxy S24',
        version: '1.0',
        recipe_type: 'manufacturing',
        status: 'draft',
        standard_quantity: 1000,
        unit_of_measure: 'units',
        estimated_time_minutes: 480,
        instructions:
          '1. Prepare PCB\n2. Mount components\n3. Test functionality',
        quality_requirements: 'All components must pass QC inspection',
        safety_notes: 'Use ESD protection when handling components',
        recipe_items: [
          {
            id: 1,
            material_product: {
              id: 123,
              name: 'Display Panel',
              sku: 'DP-S24-001',
            },
            material_type: 'component',
            required_quantity: 1000,
            unit_of_measure: 'pieces',
            unit_cost: 120.0,
            total_cost: 120000.0,
            consumption_rate: 0.5,
            waste_percentage: 1.0,
            is_optional: false,
            priority: 1,
          },
          {
            id: 2,
            material_product: {
              id: 124,
              name: 'Battery',
              sku: 'BAT-S24-001',
            },
            material_type: 'component',
            required_quantity: 1000,
            unit_of_measure: 'pieces',
            unit_cost: 45.0,
            total_cost: 45000.0,
            consumption_rate: 0.2,
            waste_percentage: 0.5,
            is_optional: false,
            priority: 2,
          },
        ],
        summary: {
          total_material_cost: 165000.0,
          total_materials: 2,
          optional_materials: 0,
          required_materials: 2,
        },
        created_at: '2025-01-22T10:00:00.000Z',
        updated_at: '2025-01-22T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  create(
    @Body() createProductionRecipeDto: CreateProductionRecipeDto,
    @Request() req,
  ) {
    return this.productionRecipeService.create(
      createProductionRecipeDto,
      req.user.id,
    );
  }

  @Get()
  @Permissions('production.view')
  @ApiOperation({
    summary: 'Get all production recipes with pagination and filters',
  })
  findAll(@Query() query: any) {
    return this.productionRecipeService.findAll(query);
  }

  @Get('calculate/:id')
  @Permissions('production.view')
  @ApiOperation({
    summary: 'Calculate material requirements for a specific quantity',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns calculated material requirements',
    schema: {
      example: {
        recipe_id: 1,
        recipe_code: 'RECIPE-SG-S24-001',
        recipe_name: 'Samsung Galaxy S24 Manufacturing Recipe',
        standard_quantity: 1000,
        requested_quantity: 1500,
        multiplier: 1.5,
        total_estimated_cost: 247500.0,
        material_requirements: [
          {
            material_product_id: 123,
            material_name: 'Display Panel',
            material_type: 'component',
            required_quantity: 1500,
            unit_of_measure: 'pieces',
            estimated_cost: 180000.0,
            waste_percentage: 1.0,
            total_with_waste: 1515,
            is_optional: false,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production recipe not found' })
  calculateRequirements(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
  ) {
    return this.productionRecipeService.calculateMaterialRequirements(
      +id,
      +quantity,
    );
  }

  @Get('consumption')
  @Permissions('production.view')
  @ApiOperation({ summary: 'Get material consumption records' })
  @ApiResponse({
    status: 200,
    description: 'Returns material consumption records with pagination',
    schema: {
      example: {
        data: [
          {
            id: 1,
            production_order: {
              id: 1,
              order_number: 'PO-2025-001',
            },
            production_order_item: {
              id: 1,
              product: {
                name: 'Samsung Galaxy S24',
              },
            },
            recipe_item: {
              id: 1,
              material_product: {
                name: 'Display Panel',
              },
            },
            inventory_batch: {
              id: 123,
              batch_no: 'BATCH-DP-001',
              quantity: 2000,
            },
            planned_quantity: 1000,
            actual_quantity: 998,
            wasted_quantity: 2,
            unit_cost: 120.0,
            total_cost: 119760.0,
            status: 'consumed',
            consumption_date: '2025-01-26T14:30:00.000Z',
            created_at: '2025-01-26T14:30:00.000Z',
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
  getMaterialConsumption(@Query() query: MaterialConsumptionQueryDto) {
    return this.productionRecipeService.getMaterialConsumption(query);
  }

  @Get(':id')
  @Permissions('production.view')
  @ApiOperation({ summary: 'Get production recipe by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns production recipe details with summary',
    schema: {
      example: {
        id: 1,
        name: 'Samsung Galaxy S24 Manufacturing Recipe',
        recipe_code: 'RECIPE-SG-S24-001',
        finished_product: {
          id: 1,
          name: 'Samsung Galaxy S24',
          sku: 'SAM-S24-256GB',
        },
        description: 'Complete manufacturing process for Samsung Galaxy S24',
        version: '1.0',
        recipe_type: 'manufacturing',
        status: 'active',
        standard_quantity: 1000,
        unit_of_measure: 'units',
        estimated_time_minutes: 480,
        instructions:
          '1. Prepare PCB\n2. Mount components\n3. Test functionality',
        quality_requirements: 'All components must pass QC inspection',
        safety_notes: 'Use ESD protection when handling components',
        yield_percentage: 95.5,
        recipe_items: [
          {
            id: 1,
            material_product: {
              id: 123,
              name: 'Display Panel',
              sku: 'DP-S24-001',
            },
            material_type: 'component',
            required_quantity: 1000,
            unit_of_measure: 'pieces',
            unit_cost: 120.0,
            total_cost: 120000.0,
            consumption_rate: 0.5,
            waste_percentage: 1.0,
            specifications: 'Grade A OLED display',
            quality_notes: 'Must pass brightness and color calibration',
            priority: 1,
            is_optional: false,
          },
        ],
        summary: {
          total_material_cost: 165000.0,
          total_materials: 2,
          optional_materials: 0,
          required_materials: 2,
          total_required_quantity: 2000,
          average_waste_percentage: 0.75,
          material_types: ['component'],
        },
        created_at: '2025-01-22T10:00:00.000Z',
        updated_at: '2025-01-22T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production recipe not found' })
  findOne(@Param('id') id: string) {
    return this.productionRecipeService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('production.edit')
  @ApiOperation({ summary: 'Update production recipe by ID' })
  @ApiResponse({
    status: 200,
    description: 'Production recipe updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Updated Samsung Galaxy S24 Manufacturing Recipe',
        version: '2.0',
        status: 'active',
        standard_quantity: 1500,
        recipe_items: [
          {
            id: 1,
            required_quantity: 1500,
            total_cost: 180000.0,
          },
        ],
        summary: {
          total_material_cost: 247500.0,
          total_materials: 2,
          required_materials: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production recipe not found' })
  update(
    @Param('id') id: string,
    @Body() updateProductionRecipeDto: UpdateProductionRecipeDto,
    @Request() req,
  ) {
    return this.productionRecipeService.update(
      +id,
      updateProductionRecipeDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @Permissions('production.delete')
  @ApiOperation({ summary: 'Delete production recipe by ID' })
  @ApiResponse({
    status: 200,
    description: 'Production recipe deleted successfully',
    schema: {
      example: {
        message: 'Production recipe deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Production recipe not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete active recipe' })
  remove(@Param('id') id: string) {
    return this.productionRecipeService.remove(+id);
  }
}

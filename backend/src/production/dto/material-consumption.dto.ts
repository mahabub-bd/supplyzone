import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ConsumptionStatus } from '../entities/material-consumption.entity';

export class CreateMaterialConsumptionDto {
  @ApiProperty({
    description: 'Production Order ID',
    example: 1,
  })
  @IsNumber()
  production_order_id: number;

  @ApiProperty({
    description: 'Production Order Item ID',
    example: 1,
  })
  @IsNumber()
  production_order_item_id: number;

  @ApiProperty({
    description: 'Recipe Item ID',
    example: 1,
  })
  @IsNumber()
  recipe_item_id: number;

  @ApiProperty({
    description: 'Inventory Batch ID to consume from',
    example: 123,
  })
  @IsNumber()
  inventory_batch_id: number;

  @ApiProperty({
    description: 'Planned quantity to consume',
    example: 100,
  })
  @IsNumber()
  planned_quantity: number;

  @ApiProperty({
    description: 'Actual quantity consumed',
    example: 98,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actual_quantity?: number;

  @ApiProperty({
    description: 'Wasted quantity',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  wasted_quantity?: number;

  @ApiProperty({
    description: 'Unit cost of material',
    example: 15.50,
  })
  @IsNumber()
  unit_cost: number;

  @ApiProperty({
    description: 'Consumption notes',
    example: 'Materials consumed from batch #BATCH-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaterialConsumptionDto {
  @ApiProperty({
    description: 'Actual quantity consumed',
    example: 95,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actual_quantity?: number;

  @ApiProperty({
    description: 'Wasted quantity',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  wasted_quantity?: number;

  @ApiProperty({
    description: 'Unit cost of material',
    example: 16.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @ApiProperty({
    description: 'Consumption status',
    enum: ConsumptionStatus,
    example: ConsumptionStatus.CONSUMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConsumptionStatus)
  status?: ConsumptionStatus;

  @ApiProperty({
    description: 'Consumption notes',
    example: 'Updated consumption notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MaterialConsumptionQueryDto {
  @ApiProperty({
    description: 'Filter by Production Order ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  production_order_id?: number;

  @ApiProperty({
    description: 'Filter by Production Order Item ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  production_order_item_id?: number;

  @ApiProperty({
    description: 'Filter by Recipe Item ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recipe_item_id?: number;

  @ApiProperty({
    description: 'Filter by Inventory Batch ID',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  inventory_batch_id?: number;

  @ApiProperty({
    description: 'Filter by consumption status',
    enum: ConsumptionStatus,
    example: ConsumptionStatus.CONSUMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConsumptionStatus)
  status?: ConsumptionStatus;

  @ApiProperty({
    description: 'Filter by material product ID',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  material_product_id?: number;

  @ApiProperty({
    description: 'Filter by consumption date from',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  consumption_date_from?: string;

  @ApiProperty({
    description: 'Filter by consumption date to',
    example: '2025-01-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  consumption_date_to?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class BulkMaterialConsumptionDto {
  @ApiProperty({
    description: 'Array of material consumption records',
    type: [CreateMaterialConsumptionDto],
  })
  @IsArray()
  consumptions: CreateMaterialConsumptionDto[];
}
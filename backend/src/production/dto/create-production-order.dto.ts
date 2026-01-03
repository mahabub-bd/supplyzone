import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductionPriority } from '../entities/production-order.entity';

export class ProductionOrderItemDto {
  @ApiProperty({
    description: 'Product ID to manufacture',
    example: 1,
  })
  @IsNumber()
  product_id: number;

  @ApiProperty({
    description: 'Recipe ID to use for production (optional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recipe_id?: number;

  @ApiProperty({
    description: 'Planned quantity to produce',
    example: 1000,
  })
  @IsNumber()
  planned_quantity: number;

  @ApiProperty({
    description: 'Unit cost per item',
    example: 450.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @ApiProperty({
    description: 'Production specifications',
    example: 'Premium version with additional features',
    required: false,
  })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({
    description: 'Expiry date (if applicable)',
    example: '2028-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}

export class CreateProductionOrderDto {
  @ApiProperty({
    description: 'Production Order title',
    example: 'Samsung Galaxy S24 Production Batch',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the production order',
    example: 'Production of 1000 units of Samsung Galaxy S24',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Brand ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiProperty({
    description: 'Target warehouse ID',
    example: 1,
  })
  @IsNumber()
  warehouse_id: number;

  @ApiProperty({
    description: 'Production priority',
    enum: ProductionPriority,
    example: ProductionPriority.NORMAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductionPriority)
  priority?: ProductionPriority;

  @ApiProperty({
    description: 'Planned start date',

    required: false,
  })
  @IsOptional()
  @IsDateString()
  planned_start_date?: string;

  @ApiProperty({
    description: 'Planned completion date',

    required: false,
  })
  @IsOptional()
  @IsDateString()
  planned_completion_date?: string;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assigned_to?: number;

  @ApiProperty({
    description: 'Production order notes',
    example: 'Special packaging requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Production order items',
    type: [ProductionOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionOrderItemDto)
  items: ProductionOrderItemDto[];
}

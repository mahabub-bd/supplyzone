import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaterialType } from '../entities/production-recipe-item.entity';

export class CreateRecipeItemDto {
  @ApiProperty({
    description: 'Material/Product ID used in this recipe',
    example: 123,
  })
  @IsNumber()
  material_product_id: number;

  @ApiProperty({
    description: 'Type of material',
    enum: MaterialType,
    example: MaterialType.COMPONENT,
  })
  @IsOptional()
  @IsEnum(MaterialType)
  material_type?: MaterialType;

  @ApiProperty({
    description: 'Quantity of material required',
    example: 5,
  })
  @IsNumber()
  required_quantity: number;

  @ApiProperty({
    description: 'Unit of measure ID for the material',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unit_id?: number;

  @ApiProperty({
    description: 'Material consumption rate (%) - additional material needed for production',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  consumption_rate?: number;

  @ApiProperty({
    description: 'Material waste percentage (%)',
    example: 1.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  waste_percentage?: number;

  @ApiProperty({
    description: 'Material specifications or grade',
    example: 'Grade A electronic components',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Material priority in recipe (lower number = higher priority)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({
    description: 'Whether this material is optional',
    example: false,
    required: false,
  })
  @IsOptional()
  is_optional?: boolean;
}

export class CreateProductionRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Samsung Galaxy S24 Manufacturing Recipe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Recipe code or SKU (auto-generated if not provided)',
    example: 'RECIPE-SG-S24-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipe_code?: string;

  @ApiProperty({
    description: 'Finished product ID this recipe produces',
    example: 1,
  })
  @IsNumber()
  finished_product_id: number;

  @ApiProperty({
    description: 'Detailed description of the recipe',
    example: 'Complete manufacturing process for Samsung Galaxy S24',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Standard quantity produced by this recipe',
    example: 1000,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  standard_quantity?: number;

  @ApiProperty({
    description: 'Unit of measure ID for standard quantity',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unit_id?: number;

  @ApiProperty({
    description: 'Estimated production time in minutes',
    example: 480,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimated_time_minutes?: number;

  @ApiProperty({
    description: 'Yield percentage (0-100) - expected output efficiency',
    example: 95.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  yield_percentage?: number;

  @ApiProperty({
    description: 'Recipe materials/ingredients',
    type: [CreateRecipeItemDto],
  })
  @IsArray()
  recipe_items: CreateRecipeItemDto[];
}
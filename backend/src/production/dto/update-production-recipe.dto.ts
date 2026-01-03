import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaterialType } from '../entities/production-recipe-item.entity';
import { RecipeStatus } from '../entities/production-recipe.entity';

export class UpdateRecipeItemDto {
  @ApiProperty({
    description: 'Recipe Item ID',
    example: 1,
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Material/Product ID used in this recipe',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  material_product_id?: number;

  @ApiProperty({
    description: 'Type of material',
    enum: MaterialType,
    example: MaterialType.COMPONENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MaterialType)
  material_type?: MaterialType;

  @ApiProperty({
    description: 'Quantity of material required',
    example: 6,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  required_quantity?: number;

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
    example: 2.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  consumption_rate?: number;

  @ApiProperty({
    description: 'Material waste percentage (%)',
    example: 0.8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  waste_percentage?: number;

  @ApiProperty({
    description: 'Material specifications or grade',
    example: 'Grade B electronic components',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Material priority in recipe (lower number = higher priority)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({
    description: 'Whether this material is optional',
    example: true,
    required: false,
  })
  @IsOptional()
  is_optional?: boolean;
}

export class UpdateProductionRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Updated Samsung Galaxy S24 Manufacturing Recipe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Recipe code or SKU',
    example: 'RECIPE-SG-S24-002',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipe_code?: string;

  @ApiProperty({
    description: 'Finished product ID this recipe produces',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  finished_product_id?: number;

  @ApiProperty({
    description: 'Detailed description of the recipe',
    example: 'Updated manufacturing process for Samsung Galaxy S24',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Recipe status',
    enum: RecipeStatus,
    example: RecipeStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

  @ApiProperty({
    description: 'Standard quantity produced by this recipe',
    example: 1500,
    required: false,
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
    example: 520,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimated_time_minutes?: number;

  @ApiProperty({
    description: 'Yield percentage (0-100) - expected output efficiency',
    example: 96.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  yield_percentage?: number;

  @ApiProperty({
    description: 'Recipe materials/ingredients',
    type: [UpdateRecipeItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  recipe_items?: UpdateRecipeItemDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductType } from '../enums/product-type.enum';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Stock keeping unit',
    example: 'IP15PM-256GB-BLK',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '8901276085017',
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'Apple iPhone...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Selling price', example: 189999 })
  @IsNumber()
  selling_price: number;

  @ApiProperty({ description: 'Purchase price', example: 160000 })
  @IsNumber()
  purchase_price: number;

  @ApiPropertyOptional({ description: 'Discount price', example: 179999 })
  @IsNumber()
  @IsOptional()
  discount_price?: number;

  @ApiPropertyOptional({ description: 'Status (true = active)', example: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Product type for categorization in production',
    enum: ProductType,
    example: ProductType.RAW_MATERIAL,
  })
  @IsEnum(ProductType)
  @IsOptional()
  product_type?: ProductType;

  @ApiPropertyOptional({ description: 'Brand ID', example: 1 })
  @IsNumber()
  @IsOptional()
  brand_id?: number;

  @ApiPropertyOptional({
    description: 'Category reference ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Subcategory reference ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  subcategory_id?: number;

  @ApiPropertyOptional({
    description: 'Unit reference ID (e.g., piece, box, kg)',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  unit_id?: number;

  @ApiPropertyOptional({ description: 'Supplier ID', example: 1 })
  @IsNumber()
  @IsOptional()
  supplier_id?: number;

  @ApiPropertyOptional({
    description: 'Associated tag IDs',
    example: [1, 2],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tag_ids?: number[];

  @ApiPropertyOptional({ description: 'Image IDs', example: [7, 8] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  image_ids?: number[];

  @ApiPropertyOptional({
    description: 'Product origin/country of manufacture',
    example: 'China',
  })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Product expiration date',
    example: '2025-12-31',
  })
  @IsOptional()
  expire_date?: Date;
}

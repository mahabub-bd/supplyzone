import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export class QuotationItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 5,
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Unit price override (if different from product price)',
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  unit_price?: number;

  @ApiPropertyOptional({
    description: 'Discount type for this item',
    enum: DiscountType,
    example: 'percentage',
  })
  @IsOptional()
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description: 'Discount value for this item',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({
    description: 'Tax percentage for this item',
    example: 15,
  })
  @IsOptional()
  @Min(0)
  @Max(100)
  tax_percentage?: number;

  @ApiPropertyOptional({
    description: 'Notes or comments about this specific item',
    example: 'Custom color option',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export class SaleItemDto {
  @ApiProperty({
    description: 'Product ID being sold',
    example: 12,
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    description: 'Warehouse ID from where stock will be deducted',
    example: 1,
  })
  @IsInt()
  warehouse_id: number;

  @ApiProperty({
    description: 'Quantity of the product being sold',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Discount type: "fixed" for fixed amount (e.g., 500) or "percentage" for percentage (e.g., 10 = 10%)',
    example: 'percentage',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description: 'Discount value. If type is "percentage", this is the percentage (e.g., 10 = 10%). If type is "fixed", this is the amount (e.g., 500)',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({
    description: 'Tax percentage (e.g., 15 = 15% VAT). If 0 or not provided, no tax is applied',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;
}

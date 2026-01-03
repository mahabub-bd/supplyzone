import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DiscountType, SaleItemDto } from './sale-item.dto';

export class CreateSaleDto {
  @ApiProperty({
    description: 'List of products being sold',
    type: [SaleItemDto],
    example: [
      {
        product_id: 1,
        warehouse_id: 2,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional({
    description:
      'Sale-level discount type: "fixed" for fixed amount or "percentage" for percentage discount',
    example: 'fixed',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description:
      'Sale-level discount value. Applied to entire sale after item discounts. If type is "percentage", this is % (e.g., 10 = 10%). If type is "fixed", this is amount (e.g., 1750)',
    example: 1750,
  })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({
    description:
      'Sale-level tax percentage. Applied to entire sale after discounts (e.g., 15 = 15% VAT). If 0 or not provided, no tax is applied',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @ApiPropertyOptional({
    description: 'Total amount paid by customer',
    example: 33250,
  })
  @IsOptional()
  @IsNumber()
  paid_amount?: number;

  @ApiPropertyOptional({
    description: 'Customer ID for credit sale or tracking',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({
    description:
      'Custom invoice number (optional). Auto-generates if not provided.',
    example: 'INV-20251128-0005',
  })
  @IsOptional()
  @IsString()
  invoice_no?: string;

  @ApiProperty({
    description: 'Branch ID of the sale',
    example: 1,
  })
  @IsInt()
  branch_id: number;

  @ApiPropertyOptional({
    description: 'List of payments for this sale',
    example: [{ method: 'cash', amount: 33250, account_code: 'ASSET.CASH' }],
  })
  @IsOptional()
  @IsArray()
  payments?: any[];

  @ApiPropertyOptional({
    description: 'Type of sale: pos or regular',
    example: 'regular',
  })
  @IsOptional()
  @IsString()
  sale_type?: 'pos' | 'regular';

  @ApiPropertyOptional({
    description: 'User ID who served/processed the sale (cashier)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  served_by_id?: number;
}

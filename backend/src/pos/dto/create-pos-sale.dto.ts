import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PosItemDto } from './pos-item.dto';

export enum PaymentMethod {
  CASH = 'cash',
  BANK = 'bank',
  MOBILE = 'mobile',
  CARD = 'card',
}

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export class CreatePosSaleDto {
  @ApiProperty({
    description: 'List of items to sell',
    type: [PosItemDto],
    example: [
      {
        product_id: 1,
        quantity: 2,
        warehouse_id: 1,
        discount: 0,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosItemDto)
  items: PosItemDto[];

  @ApiProperty({
    description: 'Branch ID',
    example: 1,
  })
  @IsInt()
  branch_id: number;

  @ApiPropertyOptional({
    description: 'Customer ID (optional for walk-in customers)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({
    description: 'Discount type: fixed amount or percentage',
    enum: DiscountType,
    example: DiscountType.FIXED,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description: 'Total discount on sale. If discount_type is "percentage", this is % (e.g., 10 = 10%). If "fixed", this is amount (e.g., 500)',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({
    description: 'Tax percentage',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'Amount paid by customer',
    example: 10000,
  })
  @IsNumber()
  paid_amount: number;

  @ApiPropertyOptional({
    description: 'Account code for payment',
    example: 'ASSET.CASH',
  })
  @IsOptional()
  account_code?: string;

  @ApiPropertyOptional({
    description: 'Cash register ID (required for cash payments)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  cash_register_id?: number;
}

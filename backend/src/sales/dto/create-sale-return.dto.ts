import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleReturnItemDto {
  @ApiProperty({
    description: 'Original sale item ID',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  sale_item_id: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @ApiProperty({
    description: 'Quantity to return',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  returned_quantity: number;

  @ApiPropertyOptional({
    description: 'Reason for returning this specific item',
    example: 'Defective product',
  })
  @IsOptional()
  @IsString()
  return_reason?: string;

  @ApiPropertyOptional({
    description: 'Condition of returned item',
    example: 'damaged',
    enum: ['new', 'good', 'damaged', 'defective', 'missing_parts'],
  })
  @IsOptional()
  @IsEnum(['new', 'good', 'damaged', 'defective', 'missing_parts'])
  item_condition?: 'new' | 'good' | 'damaged' | 'defective' | 'missing_parts';
}

export class CreateSaleReturnDto {
  @ApiPropertyOptional({
    description: 'Custom return number (auto-generated if not provided)',
    example: 'SR-20251203-0001',
  })
  @IsOptional()
  @IsString()
  return_no?: string;

  @ApiProperty({
    description: 'Original sale ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  sale_id: number;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  customer_id: number;

  @ApiProperty({
    description: 'Warehouse ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  warehouse_id: number;

  @ApiProperty({
    description: 'Branch ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  branch_id: number;

  @ApiPropertyOptional({
    description: 'Reason for return',
    example: 'Products not as expected',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Return status',
    example: 'draft',
    enum: ['draft', 'approved', 'processed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['draft', 'approved', 'processed', 'cancelled'])
  status?: 'draft' | 'approved' | 'processed' | 'cancelled';

  @ApiPropertyOptional({
    description: 'Refund method',
    example: 'cash',
    enum: ['cash', 'bank', 'mobile', 'store_credit', 'exchange'],
  })
  @IsOptional()
  @IsEnum(['cash', 'bank', 'mobile', 'store_credit', 'exchange'])
  refund_method?: 'cash' | 'bank' | 'mobile' | 'store_credit' | 'exchange';

  @ApiPropertyOptional({
    description: 'Refund amount already paid',
    example: 3000.0,
  })
  @IsOptional()
  @IsNumber()
  refunded_amount?: number;

  @ApiPropertyOptional({
    description: 'Notes about refund processing',
  })
  @IsOptional()
  @IsString()
  refund_notes?: string;

  @ApiProperty({
    description: 'Items to return',
    type: [SaleReturnItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleReturnItemDto)
  items: SaleReturnItemDto[];
}
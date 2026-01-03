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
import { PurchaseReturnStatus } from '../enums/purchase-return-status.enum';

export class PurchaseReturnItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @ApiPropertyOptional({
    description:
      'Original purchase item ID (if linking to specific purchase item)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  purchase_item_id?: number;

  @ApiProperty({
    description: 'Quantity to return',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  returned_quantity: number;

  @ApiProperty({
    description: 'Original purchase price per unit',
    example: 500.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreatePurchaseReturnDto {
  @ApiPropertyOptional({
    description: 'Custom return number (auto-generated if not provided)',
    example: 'PR-2025-001',
  })
  @IsOptional()
  @IsString()
  return_no?: string;

  @ApiProperty({
    description: 'Original purchase ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  purchase_id: number;

  @ApiProperty({
    description: 'Supplier ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  supplier_id: number;

  @ApiProperty({
    description: 'Warehouse ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  warehouse_id: number;

  @ApiPropertyOptional({
    description: 'Reason for return',
    example: 'Damaged goods received',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Return status',
    example: PurchaseReturnStatus.DRAFT,
    enum: PurchaseReturnStatus,
  })
  @IsOptional()
  @IsEnum(PurchaseReturnStatus)
  status?: PurchaseReturnStatus;

  @ApiPropertyOptional({
    description:
      'Number of days for payment terms (calculated automatically if not provided)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  days_count?: number;

  @ApiProperty({
    description: 'Items to return',
    type: [PurchaseReturnItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnItemDto)
  items: PurchaseReturnItemDto[];
}

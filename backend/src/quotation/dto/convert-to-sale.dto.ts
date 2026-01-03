import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ConvertToSalePaymentDto {
  @ApiProperty({
    description: 'Payment method',
    example: 'cash',
  })
  @IsString()
  method: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 5000,
  })
  @IsInt()
  amount: number;

  @ApiPropertyOptional({
    description: 'Account code for accounting integration',
    example: 'ASSET.CASH',
  })
  @IsOptional()
  @IsString()
  account_code?: string;
}

export class ConvertToSaleDto {
  @ApiProperty({
    description: 'List of payments for converting quotation to sale',
    type: [ConvertToSalePaymentDto],
    example: [
      {
        method: 'cash',
        amount: 5000,
        account_code: 'ASSET.CASH'
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConvertToSalePaymentDto)
  payments: ConvertToSalePaymentDto[];

  @ApiPropertyOptional({
    description: 'Additional notes for the converted sale',
    example: 'Converted from quotation QTN-20251128-0005',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Branch ID for the converted sale (overrides quotation branch if provided)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Warehouse ID for sale fulfillment (overrides branch default warehouse if provided)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  warehouse_id?: number;
}
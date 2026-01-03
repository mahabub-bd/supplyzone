import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Product reference ID',
    example: 12,
  })
  @IsNumber()
  product_id: number;

  @ApiProperty({
    description: 'Warehouse reference ID',
    example: 3,
  })
  @IsNumber()
  warehouse_id: number;

  @ApiPropertyOptional({
    description: 'Batch number for inventory tracking',
    example: 'BATCH-2025-01',
  })
  @IsString()
  @IsOptional()
  batch_no?: string;

  @ApiProperty({
    description: 'Total quantity being added to inventory',
    example: 150,
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Expiry date for perishable items (Optional)',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @ApiProperty({
    description: 'Product purchase price',
    example: 1200,
  })
  @IsNumber()
  purchase_price: number;

  @ApiPropertyOptional({
    description: 'Name of the supplier (Optional)',
    example: 'Tech Distribution Ltd.',
  })
  @IsString()
  @IsOptional()
  supplier?: string;
}

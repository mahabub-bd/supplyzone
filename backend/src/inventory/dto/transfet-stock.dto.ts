import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TransferStockDto {
  @ApiProperty({ example: 12, description: 'Product ID' })
  @IsNumber()
  product_id: number;

  @ApiProperty({
    example: 1,
    description: 'Source warehouse ID (transfer from)',
  })
  @IsNumber()
  from_warehouse_id: number;

  @ApiProperty({
    example: 2,
    description: 'Destination warehouse ID (transfer to)',
  })
  @IsNumber()
  to_warehouse_id: number;

  @ApiProperty({ example: 50, description: 'Quantity to transfer' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ example: 'Transferred to main warehouse' })
  @IsString()
  @IsOptional()
  note?: string;
}

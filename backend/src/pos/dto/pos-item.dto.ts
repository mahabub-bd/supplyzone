import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class PosItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    description: 'Quantity to sell',
    example: 2,
  })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({
    description: 'Warehouse ID',
    example: 1,
  })
  @IsInt()
  warehouse_id: number;

  @ApiPropertyOptional({
    description: 'Discount amount for this item',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  discount?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Quantity to adjust the stock (use negative value for reduction)',
    example: -10, // For stock decrease | e.g., damaged or missing items
  })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Optional note explaining the stock adjustment',
    example: 'Damaged during transport',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

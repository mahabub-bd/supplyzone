import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CloseCashRegisterDto {
  @ApiProperty({
    description: 'Cash register ID to close',
    example: 1,
  })
  @IsNumber()
  cash_register_id: number;

  @ApiProperty({
    description: 'Actual cash amount counted',
    example: 14950,
  })
  @IsNumber()
  actual_amount: number;

  @ApiPropertyOptional({
    description: 'Notes about the closing or variance',
    example: 'Shortage of 50 TK due to cash refund',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
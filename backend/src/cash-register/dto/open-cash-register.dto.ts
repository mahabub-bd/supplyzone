import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class OpenCashRegisterDto {
  @ApiProperty({
    description: 'Cash register ID to open',
    example: 1,
  })
  @IsNumber()
  cash_register_id: number;

  @ApiProperty({
    description: 'Opening balance amount',
    example: 10000,
  })
  @IsNumber()
  opening_balance: number;

  @ApiPropertyOptional({
    description: 'Notes about the opening',
    example: 'Starting morning shift with 10,000 TK',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ProcessSaleReturnDto {
  @ApiProperty({
    description: 'Refund amount to process',
    example: 5000.0,
  })
  @IsNumber()
  @IsPositive()
  refund_amount: number;

  @ApiProperty({
    description: 'Refund method',
    example: 'cash',
    enum: ['cash', 'bank', 'mobile', 'store_credit', 'exchange'],
  })
  @IsEnum(['cash', 'bank', 'mobile', 'store_credit', 'exchange'])
  refund_method: 'cash' | 'bank' | 'mobile' | 'store_credit' | 'exchange';

  @ApiPropertyOptional({
    description: 'Account code for refund (if bank/mobile)',
    example: 'ASSET.BANK_ICICI',
  })
  @IsOptional()
  @IsString()
  account_code?: string;

  @ApiPropertyOptional({
    description: 'Transaction reference',
    example: 'REF-20251203-001',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about refund processing',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
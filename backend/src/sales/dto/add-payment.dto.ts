import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddPaymentDto {
  @ApiProperty({
    description: 'Payment method (e.g., cash, bank, mobile)',
    example: 'cash',
  })
  @IsString()
  method: string;

  @ApiProperty({
    description: 'Amount being paid',
    example: 1000,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description:
      'Account code for the payment (e.g., ASSET.CASH, ASSET.BANK_IBBL)',
    example: 'ASSET.CASH',
  })
  @IsOptional()
  @IsString()
  account_code?: string;

  @ApiPropertyOptional({
    description: 'Reference number for the payment (e.g., transaction ID)',
    example: 'TXN123456',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}

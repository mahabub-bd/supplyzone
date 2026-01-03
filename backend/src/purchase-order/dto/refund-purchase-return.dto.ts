import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RefundPurchaseReturnDto {
  @ApiPropertyOptional({
    description: 'Amount to refund to supplier',
    example: 5000.0,
    type: Number,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  refund_amount?: number;

  @ApiPropertyOptional({
    description: 'Payment method for refund',
    example: 'bank_transfer',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({
    description: 'Reference for refund payment',
    example: 'TRX-2025-1206-001',
  })
  @IsOptional()
  @IsString()
  refund_reference?: string;

  @ApiPropertyOptional({
    description: 'Account to debit for refund',
    example: 'ASSET.CASH',
  })
  @IsOptional()
  @IsString()
  debit_account_code?: string;

  @ApiPropertyOptional({
    description: 'Notes about refund processing',
    example: 'Refund processed via bank transfer after approval',
  })
  @IsOptional()
  @IsString()
  refund_notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProcessPurchaseReturnDto {
  @ApiPropertyOptional({
    description: 'Notes about processing',
    example: 'Item inspected and returned to supplier warehouse',
  })
  @IsOptional()
  @IsString()
  processing_notes?: string;

  @ApiPropertyOptional({
    description: 'Whether to refund money to supplier',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  refund_to_supplier?: boolean;

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
  refund_payment_method?: string;

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
    description: 'Whether to process refund later',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  refund_later?: boolean;
}

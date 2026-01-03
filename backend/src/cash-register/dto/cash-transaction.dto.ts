import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, MaxLength } from 'class-validator';

export enum CashTransactionType {
  CASH_IN = 'cash_in',
  CASH_OUT = 'cash_out',
}

export class CashTransactionDto {
  @ApiProperty({
    description: 'Cash register ID',
    example: 1,
  })
  @IsNumber()
  cash_register_id: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: CashTransactionType,
    example: CashTransactionType.CASH_IN,
  })
  @IsEnum(CashTransactionType)
  transaction_type: CashTransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 5000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Added cash for change',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  description: string;
}
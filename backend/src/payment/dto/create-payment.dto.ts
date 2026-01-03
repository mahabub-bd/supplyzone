import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.SUPPLIER,
    description: 'Type of payment (currently supports only "supplier")',
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    example: 150000,
    description: 'Payment amount (must be greater than zero)',
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than zero' })
  amount: number;

  @ApiProperty({
    enum: ['cash', 'bank', 'mobile'],
    example: 'cash',
    description: 'Payment method',
  })
  @IsString()
  method: 'cash' | 'bank' | 'mobile';

  @ApiProperty({
    required: false,
    example: 'ASSET.BANK_IBBL',
    description: 'Specific account code for payment (e.g., ASSET.BANK_IBBL for bank transfers). If not provided, defaults based on method.',
  })
  @IsOptional()
  @IsString()
  payment_account_code?: string;

  @ApiProperty({
    required: false,
    example: 'Partial payment',
    description: 'Optional payment reference note',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    required: false,
    example: 20,
    description: 'Supplier ID (required only if type = "supplier")',
  })
  @IsOptional()
  @IsNumber()
  supplier_id?: number;

  @ApiProperty({
    required: false,
    example: 6,
    description: 'Purchase ID (required only if type = "supplier")',
  })
  @IsOptional()
  @IsNumber()
  purchase_id?: number;

  @ApiProperty({
    required: false,
    example: 15,
    description: 'Customer ID (required only if type = "customer")',
  })
  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @ApiProperty({
    required: false,
    example: 8,
    description: 'Sale ID (required only if type = "customer")',
  })
  @IsOptional()
  @IsNumber()
  sale_id?: number;
}

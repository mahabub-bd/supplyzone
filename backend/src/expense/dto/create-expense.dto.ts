import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Office rent', description: 'Title of the expense' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Monthly rent paid for office',
    description: 'Optional description of the expense',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 3, description: 'Expense category ID (FK)' })
  @IsNumber()
  @Type(() => Number)
  category_id: number;

  @ApiPropertyOptional({
    example: 'https://example.com/receipt.jpg',
    description: 'Optional receipt attachment URL',
  })
  @IsOptional()
  @IsString()
  receipt_url?: string;

  @ApiProperty({
    example: 1,
    description: 'Branch ID where the expense was made (FK)',
  })
  @IsNumber()
  @Type(() => Number)
  branch_id: number;

  @ApiProperty({ enum: ['cash', 'bank', 'mobile'], example: 'bank' })
  @IsEnum(['cash', 'bank', 'mobile'], {
    message: 'payment_method must be either cash, bank, or mobile',
  })
  payment_method: string;

  @ApiPropertyOptional({
    example: 'ASSET.BANK_IBBL',
    description: 'Chart of account code if bank or cash selected',
  })
  @IsOptional()
  @IsString()
  account_code?: string;
}

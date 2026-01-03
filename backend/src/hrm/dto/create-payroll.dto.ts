import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayrollStatus, PaymentMethod } from '../entities/payroll-record.entity';
import { PayrollItemType } from '../entities/payroll-item.entity';

class PayrollItemDto {
  @ApiProperty({ example: 'Transport Allowance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PayrollItemType })
  @IsEnum(PayrollItemType)
  @IsNotEmpty()
  type: PayrollItemType;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 5.5 })
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiPropertyOptional({ example: 'Monthly transport allowance' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePayrollDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  pay_period_start: Date;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  pay_period_end: Date;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  payment_date: Date;

  @ApiPropertyOptional({ enum: PayrollStatus, default: PayrollStatus.DRAFT })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @IsNotEmpty()
  base_salary: number;

  @ApiPropertyOptional({ example: 10.5 })
  @IsOptional()
  @IsNumber()
  overtime_hours?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  overtime_rate?: number;

  @ApiPropertyOptional({ example: 787.50 })
  @IsOptional()
  @IsNumber()
  overtime_pay?: number;

  @ApiPropertyOptional({ example: 1000.00 })
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional({ example: 500.00 })
  @IsOptional()
  @IsNumber()
  bonuses?: number;

  @ApiPropertyOptional({ example: 200.00 })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional({ example: 450.00 })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @IsNumber()
  other_deductions?: number;

  @ApiProperty({ example: 6787.50 })
  @IsNumber()
  @IsNotEmpty()
  gross_salary: number;

  @ApiProperty({ example: 5987.50 })
  @IsNumber()
  @IsNotEmpty()
  net_salary: number;

  @ApiPropertyOptional({ example: 'TXN123456789' })
  @IsOptional()
  @IsString()
  payment_reference?: string;

  @ApiPropertyOptional({ example: 'January 2024 payroll' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;

  @ApiPropertyOptional({ type: [PayrollItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayrollItemDto)
  payroll_items?: PayrollItemDto[];
}
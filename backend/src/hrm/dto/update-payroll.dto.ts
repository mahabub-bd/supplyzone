import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PayrollStatus, PaymentMethod } from '../entities/payroll-record.entity';

export class UpdatePayrollDto {
  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  payment_date?: Date;

  @ApiPropertyOptional({ enum: PayrollStatus })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

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

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @IsNumber()
  insurance?: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @IsNumber()
  other_deductions?: number;

  @ApiPropertyOptional({ example: 'TXN123456789' })
  @IsOptional()
  @IsString()
  payment_reference?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
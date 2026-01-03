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
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/payroll-record.entity';

class EmployeeAllowanceDto {
  @ApiProperty({ example: 'Transport Allowance' })
  @IsString()
  name: string;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  percentage?: number;
}

class EmployeeDeductionDto {
  @ApiProperty({ example: 'Loan Payment' })
  @IsString()
  name: string;

  @ApiProperty({ example: 300.00 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  percentage?: number;
}

class EmployeePayrollDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employee_id: number;

  @ApiPropertyOptional({ example: 500.00 })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ type: [EmployeeAllowanceDto] })
  @IsOptional()
  allowances?: EmployeeAllowanceDto[];

  @ApiPropertyOptional({ type: [EmployeeDeductionDto] })
  @IsOptional()
  deductions?: EmployeeDeductionDto[];
}

export class ProcessPayrollDto {
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

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  overtime_rate?: number;

  @ApiPropertyOptional({ example: 0.2 })
  @IsOptional()
  @IsNumber()
  custom_tax_rate?: number;

  
  @ApiProperty({ type: [EmployeePayrollDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeePayrollDto)
  employees: EmployeePayrollDto[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @ApiPropertyOptional({ example: 'January 2024 payroll processing' })
  @IsOptional()
  @IsString()
  notes?: string;
}
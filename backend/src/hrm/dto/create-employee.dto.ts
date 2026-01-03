import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EmployeeStatus,
  EmployeeType,
  Gender,
} from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employee_code: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, State' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  hire_date: Date;

  @ApiPropertyOptional({ enum: Gender, description: 'Employee gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ enum: EmployeeType, default: EmployeeType.FULL_TIME })
  @IsEnum(EmployeeType)
  @IsNotEmpty()
  employee_type: EmployeeType;

  @ApiPropertyOptional({ example: 1, description: 'Designation ID' })
  @IsOptional()
  @IsNumber()
  designationId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiProperty({ example: 50000.0 })
  @IsNumber()
  @IsNotEmpty()
  base_salary: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  reportingManagerId?: number;

  @ApiPropertyOptional({ example: 'Employee notes and remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  EmployeeStatus,
  EmployeeType,
  Gender,
} from '../entities/employee.entity';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP-MGR-002' })
  @IsOptional()
  @IsString()
  employee_code?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional({ enum: Gender, description: 'Employee gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ enum: EmployeeType })
  @IsOptional()
  @IsEnum(EmployeeType)
  employee_type?: EmployeeType;

  @ApiPropertyOptional({ example: 2, description: 'Designation ID' })
  @IsOptional()
  @IsNumber()
  designationId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({ example: 55000.0 })
  @IsOptional()
  @IsNumber()
  base_salary?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

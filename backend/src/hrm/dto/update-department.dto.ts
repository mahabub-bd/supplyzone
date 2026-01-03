import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, MaxLength } from 'class-validator';
import { DepartmentStatus } from '../entities/department.entity';

export class UpdateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Engineering',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Department description',
    example: 'Software development and IT support',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Department status',
    enum: DepartmentStatus,
    required: false,
  })
  @IsEnum(DepartmentStatus)
  @IsOptional()
  status?: DepartmentStatus;

  @ApiProperty({
    description: 'Department code',
    example: '001',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Department manager name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  manager_name?: string;

  @ApiProperty({
    description: 'Department manager email',
    example: 'manager@company.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  manager_email?: string;

  @ApiProperty({
    description: 'Additional department notes',
    example: 'Additional department notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    description: 'Branch ID where the department belongs',
    example: '1',
    required: false,
  })
  @IsString()
  @IsOptional()
  branch_id?: string;
}
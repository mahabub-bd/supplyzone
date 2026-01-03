import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, IsNumber, IsBoolean } from 'class-validator';
import { DesignationLevel } from '../entities/designation.entity';

export class CreateDesignationDto {
  @ApiProperty({
    description: 'Title of the designation',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Code for the designation',
    example: 'SENIOR_SWE_001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Level of the designation',
    enum: DesignationLevel,
    example: DesignationLevel.SENIOR_EXECUTIVE,
  })
  @IsEnum(DesignationLevel)
  @IsNotEmpty()
  level: DesignationLevel;

  @ApiProperty({
    description: 'Description of the designation role',
    example: 'Senior software engineer responsible for designing and implementing complex features',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Minimum salary for this designation',
    example: 80000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minSalary?: number;

  @ApiProperty({
    description: 'Maximum salary for this designation',
    example: 120000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxSalary?: number;

  @ApiProperty({
    description: 'Maximum leave days that can be auto-approved',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  autoApproveLeaveDays?: number;

  @ApiProperty({
    description: 'Can approve leave requests',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canApproveLeave?: boolean;

  @ApiProperty({
    description: 'Can approve payroll',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  canApprovePayroll?: boolean;

  @ApiProperty({
    description: 'Parent designation for hierarchy',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentDesignationId?: number;

  
  @ApiProperty({
    description: 'Is this designation active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
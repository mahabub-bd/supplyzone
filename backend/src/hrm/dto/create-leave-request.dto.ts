import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
import { LeaveType } from '../entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty({ example: '2024-02-05' })
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  
  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leave_type: LeaveType;

  @ApiProperty({ example: 'Family vacation' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;
}
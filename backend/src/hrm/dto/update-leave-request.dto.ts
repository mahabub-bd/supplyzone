import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveStatus, LeaveType } from '../entities/leave-request.entity';

export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiPropertyOptional({ example: '2024-02-05' })
  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @ApiPropertyOptional({ example: 5.0 })
  @IsOptional()
  @IsNumber()
  days_count?: number;

  @ApiPropertyOptional({ enum: LeaveType })
  @IsOptional()
  @IsEnum(LeaveType)
  leave_type?: LeaveType;

  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({ example: 'Updated reason for leave' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Leave request rejected due to insufficient notice' })
  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @ApiPropertyOptional({ example: 'Approved by manager' })
  @IsOptional()
  @IsString()
  approver_notes?: string;
}
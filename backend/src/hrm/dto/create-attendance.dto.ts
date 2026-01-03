import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsOptional()
  @IsString()
  check_in?: string;

  @ApiPropertyOptional({ example: '18:00:00' })
  @IsOptional()
  @IsString()
  check_out?: string;

  @ApiPropertyOptional({ example: 8.0 })
  @IsOptional()
  @IsNumber()
  regular_hours?: number;

  @ApiPropertyOptional({ example: 2.0 })
  @IsOptional()
  @IsNumber()
  overtime_hours?: number;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Employee arrived on time' })
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
}
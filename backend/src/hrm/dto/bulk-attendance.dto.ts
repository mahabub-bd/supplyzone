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
import { AttendanceStatus } from '../entities/attendance.entity';

class AttendanceRecordDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

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

  @ApiPropertyOptional({ example: 'Employee note' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  attendance_records: AttendanceRecordDto[];

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;
}
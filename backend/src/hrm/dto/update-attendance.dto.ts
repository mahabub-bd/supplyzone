import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

export class UpdateAttendanceDto {
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

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Updated attendance note' })
  @IsOptional()
  @IsString()
  notes?: string;
}
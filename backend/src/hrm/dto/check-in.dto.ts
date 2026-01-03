import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CheckInDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the employee checking in'
  })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the branch where employee is checking in',
    required: false
  })
  @IsNumber()
  @IsOptional()
  branch_id?: number;

  @ApiProperty({
    example: '2024-12-09T09:00:00Z',
    description: 'Check-in timestamp (optional, defaults to current time)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  check_in_time?: Date;
}

export class CheckOutDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the employee checking out'
  })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the branch where employee is checking out',
    required: false
  })
  @IsNumber()
  @IsOptional()
  branch_id?: number;

  @ApiProperty({
    example: '2024-12-09T17:00:00Z',
    description: 'Check-out timestamp (optional, defaults to current time)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  check_out_time?: Date;
}
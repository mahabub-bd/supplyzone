import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class TerminateEmployeeDto {
  @ApiProperty({
    example: '2024-12-31',
    description: 'The date of termination'
  })
  @IsDateString()
  @IsNotEmpty()
  termination_date: Date;

  @ApiProperty({
    example: 'Resignation due to personal reasons',
    description: 'Reason for termination'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
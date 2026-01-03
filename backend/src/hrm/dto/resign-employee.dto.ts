import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ResignEmployeeDto {
  @ApiProperty({
    example: '2024-12-31',
    description: 'The last working day / resignation date'
  })
  @IsDateString()
  @IsNotEmpty()
  resignation_date: Date;

  @ApiProperty({
    example: 'Accepted new job opportunity with better compensation',
    description: 'Reason for resignation'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'Wishing the employee success in future endeavors',
    description: 'Additional notes about the resignation'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
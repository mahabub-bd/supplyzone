import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({
    example: 'Office Supplies',
    description: 'Name of the expense category',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Expenses related to office items such as pens, papers, etc.',
    description: 'Optional description of the expense category',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

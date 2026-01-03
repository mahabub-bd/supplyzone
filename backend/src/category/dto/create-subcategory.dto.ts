import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ example: 'Laptops' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics-laptops' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Main Category ID'
  })
  @IsString()
  category_id: string;

  @ApiPropertyOptional({ example: 'Best portable devices' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 5, description: 'Attachment ID' })
  @IsOptional()
  @IsNumber()
  logo_attachment_id?: number;
}

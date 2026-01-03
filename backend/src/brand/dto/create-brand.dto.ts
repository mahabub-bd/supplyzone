import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Samsung' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Technology and electronics brand.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Attachment ID from file upload',
  })
  @IsOptional()
  @IsString()
  logo_attachment_id?: string;
}
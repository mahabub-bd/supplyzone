import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

// 🔹 Main Category
export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'electronics' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Devices, gadgets, and accessories' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Attachment ID from file upload',
  })
  @IsOptional()
  @IsNumber()
  logo_attachment_id?: number;
}


// 🔹 Sub Category
export class CreateSubCategoryDto {
  @ApiProperty({ example: 'Laptops' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'electronics-laptops' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: '1',
    description: 'Main Category ID'
  })
  @IsString()
  category_id: string; // Now mandatory ✔

  @ApiPropertyOptional({ example: 'Best portable devices' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 5, description: 'Attachment ID' })
  @IsOptional()
  @IsNumber()
  logo_attachment_id?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'KG' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Weight measurement unit', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

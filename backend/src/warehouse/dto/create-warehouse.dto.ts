import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Warehouse name',
    example: 'Dhaka Warehouse',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Warehouse location',
    example: 'Dhaka',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Full address of the warehouse',
    example: 'House 12, Road 5, Uttara Sector 7, Dhaka',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Warehouse active status (true = active)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

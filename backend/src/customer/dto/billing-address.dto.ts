import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BillingAddressDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Contact person name',
  })
  @IsOptional()
  @IsString()
  contact_name?: string;

  @ApiPropertyOptional({
    example: '01700000000',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Main Street', description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Dhaka', description: 'City name' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Bangladesh', description: 'Country name' })
  @IsNotEmpty()
  @IsString()
  country: string;
}

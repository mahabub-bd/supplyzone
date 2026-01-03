import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Techno Distributors Ltd.',
    description: 'Name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Mahabub Hossain',
    description: 'Primary contact person',
  })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiProperty({
    required: false,
    example: '+8801712345678',
    description: 'Supplier phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    example: 'supplier@example.com',
    description: 'Supplier email address',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    required: false,
    example: '123/4 B, Barishal Sadar, Barishal, Bangladesh',
    description: 'Supplier full address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    required: false,
    example: 'Net 30 days',
    description: 'Payment term or agreement',
  })
  @IsOptional()
  @IsString()
  payment_terms?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSettingDto {
  @ApiPropertyOptional({
    description: 'Business name',
    example: 'My Retail Store',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  business_name?: string;

  @ApiPropertyOptional({
    description: 'Business tagline or description',
    example: 'Your trusted retail partner',
  })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Business email address',
    example: 'contact@mybusiness.com',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Business phone number',
    example: '+1-234-567-8900',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Full business address',
    example: '123 Main St, City, State 12345',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Country where the business is located',
    example: 'Bangladesh',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://mybusiness.com',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Primary currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Currency symbol',
    example: '$',
    default: '$',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency_symbol?: string;

  @ApiPropertyOptional({
    description: 'Tax registration number',
    example: 'TX123456789',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tax_registration?: string;

  @ApiPropertyOptional({
    description: 'Company registration number',
    example: 'REG987654321',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  company_registration?: string;

  @ApiPropertyOptional({
    description: 'Default tax percentage',
    example: 10,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  default_tax_percentage?: number;

  @ApiPropertyOptional({
    description: 'Low stock threshold percentage',
    example: 20,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  low_stock_threshold?: number;

  @ApiPropertyOptional({
    description: 'Footer text for invoices and receipts',
    example: 'Thank you for your business!',
  })
  @IsString()
  @IsOptional()
  footer_text?: string;

  @ApiPropertyOptional({
    description: 'Receipt header message',
    example: 'Original Receipt',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  receipt_header?: string;

  @ApiPropertyOptional({
    description: 'Whether to include barcode on receipts',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  include_barcode?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to include customer details on receipts',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  include_customer_details?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to enable automatic backups',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enable_auto_backup?: boolean;

  @ApiPropertyOptional({
    description: 'Backup retention period in days',
    example: 30,
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  backup_retention_days?: number;
}
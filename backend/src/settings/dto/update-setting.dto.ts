import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingDto {
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
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Currency symbol',
    example: '$',
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
    description: 'Whether to include QR code on receipts',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  include_qr_code?: boolean;

  @ApiPropertyOptional({
    description: 'QR code content type',
    example: 'business_info',
    enum: ['business_info', 'payment_link', 'invoice_url', 'custom'],
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  qr_code_type?: string;

  @ApiPropertyOptional({
    description: 'Custom QR code content URL or text',
    example: 'https://example.com/custom',
  })
  @IsString()
  @IsOptional()
  qr_code_custom_content?: string;

  @ApiPropertyOptional({
    description: 'Whether to include customer details on receipts',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  include_customer_details?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to enable automatic backups',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  enable_auto_backup?: boolean;

  @ApiPropertyOptional({
    description: 'Backup retention period in days',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  backup_retention_days?: number;

  @ApiPropertyOptional({
    description: 'Default invoice layout template',
    example: 'standard',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  default_invoice_layout?: string;

  @ApiPropertyOptional({
    description: 'Whether to show product images on invoice',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  show_product_images?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to show product SKUs on invoice',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  show_product_skus?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to show item-level tax details on invoice',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  show_item_tax_details?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to show payment breakdown on invoice',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  show_payment_breakdown?: boolean;

  @ApiPropertyOptional({
    description: 'Invoice paper size for printing',
    example: 'A4',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  invoice_paper_size?: string;

  @ApiPropertyOptional({
    description: 'Whether to print duplicate copy',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  print_duplicate_copy?: boolean;

  @ApiPropertyOptional({
    description: 'Custom invoice footer message',
    example: 'Thank you for your business!',
  })
  @IsString()
  @IsOptional()
  invoice_footer_message?: string;

  @ApiPropertyOptional({
    description: 'Whether to use thermal printer format',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  use_thermal_printer?: boolean;
}
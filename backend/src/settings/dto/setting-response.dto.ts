import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Attachment } from 'src/attachment/entities/attachment.entity';

export class SettingResponseDto {
  @ApiProperty({
    description: 'Primary key for settings record',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'Business name',
    example: 'My Retail Store',
  })
  business_name?: string;

  @ApiPropertyOptional({
    description: 'Business tagline or description',
    example: 'Your trusted retail partner',
  })
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Business email address',
    example: 'contact@mybusiness.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Business phone number',
    example: '+1-234-567-8900',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Full business address',
    example: '123 Main St, City, State 12345',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Country where the business is located',
    example: 'Bangladesh',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://mybusiness.com',
  })
  website?: string;

  @ApiProperty({
    description: 'Primary currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  currency_symbol: string;

  @ApiPropertyOptional({
    description: 'Tax registration number',
    example: 'TX123456789',
  })
  tax_registration?: string;

  @ApiPropertyOptional({
    description: 'Company registration number',
    example: 'REG987654321',
  })
  company_registration?: string;

  @ApiProperty({
    description: 'Default tax percentage',
    example: 10,
  })
  default_tax_percentage: number;

  @ApiProperty({
    description: 'Low stock threshold percentage',
    example: 20,
  })
  low_stock_threshold: number;

  @ApiPropertyOptional({
    description: 'Business logo attachment',
    type: () => Attachment,
  })
  logo_attachment?: Attachment;

  @ApiPropertyOptional({
    description: 'Footer text for invoices and receipts',
    example: 'Thank you for your business!',
  })
  footer_text?: string;

  @ApiPropertyOptional({
    description: 'Receipt header message',
    example: 'Original Receipt',
  })
  receipt_header?: string;

  @ApiProperty({
    description: 'Whether to include barcode on receipts',
    example: true,
  })
  include_barcode: boolean;

  @ApiProperty({
    description: 'Whether to include customer details on receipts',
    example: true,
  })
  include_customer_details: boolean;

  @ApiProperty({
    description: 'Whether to enable automatic backups',
    example: true,
  })
  enable_auto_backup: boolean;

  @ApiProperty({
    description: 'Backup retention period in days',
    example: 30,
  })
  backup_retention_days: number;

  @ApiProperty({
    description: 'Settings creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Settings last updated timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}
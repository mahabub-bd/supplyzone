import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @ApiProperty({
    description: 'Primary key for settings record',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Business name',
    example: 'My Retail Store',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  business_name: string;

  @ApiProperty({
    description: 'Business tagline or description',
    example: 'Your trusted retail partner',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  tagline: string;

  @ApiProperty({
    description: 'Business email address',
    example: 'contact@mybusiness.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '+1-234-567-8900',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Full business address',
    example: '123 Main St, City, State 12345',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({
    description: 'Country where the business is located',
    example: 'Bangladesh',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @ApiProperty({
    description: 'Business website URL',
    example: 'https://mybusiness.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @ApiProperty({
    description: 'Primary currency code',
    example: 'USD',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true, default: 'USD' })
  currency: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true, default: '$' })
  currency_symbol: string;

  @ApiProperty({
    description: 'Tax registration number',
    example: 'TX123456789',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  tax_registration: string;

  @ApiProperty({
    description: 'Company registration number',
    example: 'REG987654321',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  company_registration: string;

  @ApiProperty({
    description: 'Default tax percentage',
    example: 10,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  default_tax_percentage: number;

  @ApiProperty({
    description: 'Low stock threshold percentage',
    example: 20,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 20 })
  low_stock_threshold: number;

  @Column({ nullable: true })
  logo_attachment_id?: number;

  @ApiProperty({
    description: 'Business logo attachment',
    type: () => Attachment,
    required: false,
  })
  @ManyToOne(() => Attachment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logo_attachment_id' })
  logo_attachment?: Attachment;

  @ApiProperty({
    description: 'Footer text for invoices and receipts',
    example: 'Thank you for your business!',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  footer_text: string;

  @ApiProperty({
    description: 'Receipt header message',
    example: 'Original Receipt',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  receipt_header: string;

  @ApiProperty({
    description: 'Whether to include QR code on receipts',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  include_qr_code: boolean;

  @ApiProperty({
    description: 'QR code content type',
    example: 'business_info',
    required: false,
    enum: ['business_info', 'payment_link', 'invoice_url', 'custom'],
  })
  @Column({ type: 'varchar', length: 50, nullable: true, default: 'business_info' })
  qr_code_type: string;

  @ApiProperty({
    description: 'Custom QR code content URL or text',
    example: 'https://example.com/custom',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  qr_code_custom_content: string;

  @ApiProperty({
    description: 'Whether to include customer details on receipts',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: true })
  include_customer_details: boolean;

  @ApiProperty({
    description: 'Whether to enable automatic backups',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: true })
  enable_auto_backup: boolean;

  @ApiProperty({
    description: 'Backup retention period in days',
    example: 30,
    required: false,
  })
  @Column({ type: 'int', default: 30 })
  backup_retention_days: number;

  @ApiProperty({
    description: 'Default invoice layout template',
    example: 'standard',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true, default: 'standard' })
  default_invoice_layout: string;

  @ApiProperty({
    description: 'Whether to show product images on invoice',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  show_product_images: boolean;

  @ApiProperty({
    description: 'Whether to show product SKUs on invoice',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: true })
  show_product_skus: boolean;

  @ApiProperty({
    description: 'Whether to show item-level tax details on invoice',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  show_item_tax_details: boolean;

  @ApiProperty({
    description: 'Whether to show payment breakdown on invoice',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: true })
  show_payment_breakdown: boolean;

  @ApiProperty({
    description: 'Invoice paper size for printing',
    example: 'A4',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true, default: 'A4' })
  invoice_paper_size: string;

  @ApiProperty({
    description: 'Whether to print duplicate copy',
    example: false,
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  print_duplicate_copy: boolean;

  @ApiProperty({
    description: 'Custom invoice footer message',
    example: 'Thank you for your business!',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  invoice_footer_message: string;

  @ApiProperty({
    description: 'Whether to use thermal printer format',
    example: false,
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  use_thermal_printer: boolean;

  @ApiProperty({
    description: 'Settings creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Settings last updated timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
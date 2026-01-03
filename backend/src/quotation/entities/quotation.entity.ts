import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuotationItem } from './quotation-item.entity';

@Entity('quotations')
export class Quotation {
  @ApiProperty({
    description: 'Unique ID of the quotation',
    example: 101,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Auto-generated or manually provided quotation number',
    example: 'QTN-20251126-0005',
  })
  @Column({ unique: true })
  quotation_no: string;

  @ApiProperty({
    description: 'List of items in this quotation',
    type: () => [QuotationItem],
  })
  @OneToMany(() => QuotationItem, (i) => i.quotation, { cascade: true })
  items: QuotationItem[];

  @ApiProperty({
    description: 'Subtotal amount before discounts and taxes',
    example: 1500,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @ApiProperty({
    description: 'Total discount applied to the quotation',
    example: 0,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  discount: number;

  @ApiPropertyOptional({
    description: 'Manual discount applied to the quotation',
    example: 0,
  })
  @Column({ name: 'manual_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  manual_discount: number;

  @ApiPropertyOptional({
    description: 'Customer group discount applied to the quotation',
    example: 0,
  })
  @Column({ name: 'group_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  group_discount: number;

  @ApiProperty({
    description: 'Tax applied to the quotation',
    example: 0,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({
    description: 'Net total amount after discount and tax',
    example: 1500,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  total: number;

  @ApiPropertyOptional({
    description: 'Valid until date for the quotation',
    example: '2025-12-31',
  })
  @Column({ name: 'valid_until', type: 'date', nullable: true })
  valid_until?: Date;

  @ApiPropertyOptional({
    description: 'Additional terms and conditions for the quotation',
    example: 'Payment terms: 50% advance, 50% on delivery',
  })
  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  terms_and_conditions?: string;

  @ApiPropertyOptional({
    description: 'Customer associated with the quotation (optional)',
    type: () => Customer,
  })
  @ManyToOne(() => Customer, { nullable: true })
  customer?: Customer;

  @ApiPropertyOptional({
    description: 'User who created the quotation',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  created_by?: User;

  @ApiPropertyOptional({
    description: 'Branch ID where the quotation was created',
    example: 1,
  })
  @Column({ name: 'branch_id', nullable: true })
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Branch where the quotation was created',
    type: () => Branch,
  })
  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @ApiProperty({
    description: 'Current status of the quotation',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
    example: 'draft',
  })
  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

  @ApiPropertyOptional({
    description: 'Notes or internal comments about the quotation',
    example: 'Follow up with customer next week',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Quotation creation timestamp',
    example: '2025-11-26T14:10:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Quotation last updated timestamp',
    example: '2025-11-26T15:10:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
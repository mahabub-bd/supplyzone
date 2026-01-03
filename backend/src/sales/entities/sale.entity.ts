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
import { SaleItem } from './sale-item.entity';
import { SalePayment } from './sale-payment.entity';

@Entity('sales')
export class Sale {
  @ApiProperty({
    description: 'Unique ID of the sale',
    example: 101,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Auto-generated or manually provided invoice number',
    example: 'INV-20251126-0005',
  })
  @Column({ unique: true })
  invoice_no: string;

  @ApiProperty({
    description: 'List of items in this sale',
    type: () => [SaleItem],
  })
  @OneToMany(() => SaleItem, (i) => i.sale, { cascade: true })
  items: SaleItem[];

  @ApiProperty({
    description: 'Subtotal amount before discounts and taxes',
    example: 1500,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @ApiProperty({
    description: 'Total discount applied to the sale',
    example: 0,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  discount: number;

  @ApiPropertyOptional({
    description: 'Manual discount applied to the sale',
    example: 0,
  })
  @Column({ name: 'manual_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  manual_discount: number;

  @ApiPropertyOptional({
    description: 'Customer group discount applied to the sale',
    example: 0,
  })
  @Column({ name: 'group_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  group_discount: number;

  @ApiProperty({
    description: 'Tax applied to the sale',
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

  @ApiProperty({
    description: 'Total amount paid by customer',
    example: 1500,
  })
  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  paid_amount: number;

  @ApiProperty({
    description: 'Payments associated with this sale',
    type: () => [SalePayment],
  })
  @OneToMany(() => SalePayment, (p) => p.sale, { cascade: true })
  payments: SalePayment[];

  @ApiPropertyOptional({
    description: 'Customer associated with the sale (optional)',
    type: () => Customer,
  })
  @ManyToOne(() => Customer, { nullable: true })
  customer?: Customer;

  @ApiPropertyOptional({
    description: 'User who created the sale',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  created_by?: User;

  @ApiPropertyOptional({
    description: 'Branch ID where the sale occurred',
    example: 1,
  })
  @Column({ name: 'branch_id', nullable: true })
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Branch where the sale occurred',
    type: () => Branch,
  })
  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch;

  @ApiProperty({
    description: 'Current status of the sale',
    enum: ['held', 'completed', 'refunded', 'partial_refund', 'draft'],
    example: 'completed',
  })
  @Column({ type: 'varchar', length: 32, default: 'completed' })
  status: 'held' | 'completed' | 'refunded' | 'partial_refund' | 'draft';

  @ApiProperty({
    description: 'Type of sale - POS or regular sales',
    enum: ['pos', 'regular'],
    example: 'pos',
  })
  @Column({ type: 'varchar', length: 20, default: 'regular' })
  sale_type: 'pos' | 'regular';

  @ApiPropertyOptional({
    description: 'User who served/processed the sale (cashier)',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  served_by?: User;

  @ApiProperty({
    description: 'Sale creation timestamp',
    example: '2025-11-26T14:10:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Sale last updated timestamp',
    example: '2025-11-26T15:10:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}

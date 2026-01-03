import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Payment } from 'src/payment/entities/payment.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentTerm } from '../enums/payment-term.enum';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { PurchaseItem } from './purchase-item.entity';

// Alias for backward compatibility
export { PurchaseItem } from './purchase-item.entity';

@Entity('purchases') // Use existing purchases table
export class Purchase {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Purchase ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: 'Purchase Order Number (e.g., PO-2024-001)' })
  po_no: string;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  @ApiProperty({ type: () => Supplier, description: 'Supplier information' })
  supplier: Supplier;

  @Column()
  @ApiProperty({ description: 'Supplier ID' })
  supplier_id: number;

  @ManyToOne(() => Warehouse, { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  @ApiProperty({
    type: () => Warehouse,
    description: 'Warehouse where items will be delivered',
  })
  warehouse: Warehouse;

  @Column()
  @ApiProperty({ description: 'Warehouse ID' })
  warehouse_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  @ApiPropertyOptional({
    type: () => User,
    description: 'User who created the purchase',
  })
  created_by?: User;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Created by user ID' })
  created_by_id?: number;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Expected delivery date' })
  expected_delivery_date?: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Terms and conditions for the purchase' })
  terms_and_conditions?: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Notes for the purchase' })
  notes?: string;

  @Column({ type: 'enum', enum: PaymentTerm, default: PaymentTerm.NET_30 })
  @ApiProperty({ enum: PaymentTerm, description: 'Payment terms' })
  payment_term: PaymentTerm;

  @Column({ type: 'integer', nullable: true })
  @ApiPropertyOptional({
    description: 'Custom payment days when payment_term is CUSTOM',
  })
  custom_payment_days?: number;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  @ApiProperty({ enum: PurchaseOrderStatus, description: 'Purchase status' })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Subtotal of all items' })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Tax amount' })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Discount amount' })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Total amount including tax and discount' })
  total_amount: number;

  // Backward compatibility fields
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({
    description: 'Total purchase amount (backward compatibility)',
  })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Amount already paid' })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Amount due' })
  due_amount: number;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({
    description: 'Date when purchase was sent to supplier',
  })
  sent_date?: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({
    description: 'Date when purchase was approved by supplier',
  })
  approved_date?: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Date when items were received' })
  received_date?: Date;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, {
    cascade: true,
    eager: true,
  })
  items: PurchaseItem[];

  @OneToMany(() => Payment, (payment) => payment.purchase)
  @ApiPropertyOptional({
    type: () => [Payment],
    description: 'Payment history',
  })
  payment_history?: Payment[];

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Additional metadata for the purchase' })
  metadata?: Record<string, any>;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the purchase is active' })
  is_active: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at timestamp' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: Date;

  // Constructor for backward compatibility
  constructor(partial?: Partial<Purchase>) {
    if (partial) {
      Object.assign(this, partial);
      // Map old fields to new ones for compatibility
      if (partial.total) {
        this.total_amount = partial.total;
      }
    }
  }
}

// Export alias for backward compatibility
export const PurchaseOrder = Purchase;

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

import { PurchaseReturnStatus } from '../enums/purchase-return-status.enum';
import { PurchaseReturnItem } from './purchase-return-item.entity';
import { Purchase } from './purchase.entity';

@Entity('purchase_returns')
export class PurchaseReturn {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Unique return number',
    example: 'PR-2025-001',
  })
  @Column({ unique: true })
  return_no: string;

  @ApiProperty({ description: 'Reference to original purchase' })
  @Column({ name: 'purchase_id' })
  purchase_id: number;

  @ManyToOne(() => Purchase, { nullable: false })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ApiProperty({ description: 'Supplier who receives the return' })
  @Column({ name: 'supplier_id' })
  supplier_id: number;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ApiProperty({ description: 'Warehouse from which items are returned' })
  @Column({ name: 'warehouse_id' })
  warehouse_id: number;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({ description: 'Items being returned' })
  @OneToMany(() => PurchaseReturnItem, (item) => item.purchase_return, {
    cascade: true,
    eager: true,
  })
  items: PurchaseReturnItem[];

  @ApiProperty({
    description: 'Total return amount',
    example: 5000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @ApiPropertyOptional({
    description: 'Reason for return',
    example: 'Damaged goods',
  })
  @Column({ nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'Return status',
    example: 'draft',
    enum: PurchaseReturnStatus,
  })
  @Column({
    type: 'enum',
    enum: PurchaseReturnStatus,
    default: PurchaseReturnStatus.DRAFT,
  })
  status: PurchaseReturnStatus;

  @ApiPropertyOptional({
    description: 'Date when return was approved',
    example: '2025-12-03T14:30:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @ApiPropertyOptional({
    description: 'Date when return was processed',
    example: '2025-12-03T16:00:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  processed_at?: Date;

  @ApiPropertyOptional({
    description: 'User who approved the return',
    example: 1,
  })
  @Column({ name: 'approved_by', nullable: true })
  approved_by?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approved_user?: User;

  @ApiPropertyOptional({
    description: 'User who processed the return',
    example: 2,
  })
  @Column({ name: 'processed_by', nullable: true })
  processed_by?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processed_user?: User;

  @ApiPropertyOptional({
    description: 'Notes added during the approval stage',
    example: 'Approved by management - defective items confirmed',
  })
  @Column({ type: 'text', nullable: true })
  approval_notes?: string;

  @ApiPropertyOptional({
    description: 'Notes added during the processing stage',
    example: 'Item inspected and returned to supplier warehouse',
  })
  @Column({ type: 'text', nullable: true })
  processing_notes?: string;

  @ApiPropertyOptional({
    description: 'Whether money was refunded to supplier',
    example: true,
  })
  @Column({ type: 'boolean', nullable: true })
  refund_to_supplier?: boolean;

  @ApiPropertyOptional({
    description: 'Amount refunded to supplier',
    example: 5000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  refund_amount?: number;

  @ApiPropertyOptional({
    description: 'Payment method used for refund',
    example: 'bank_transfer',
  })
  @Column({ name: 'refund_payment_method', nullable: true })
  refund_payment_method?: string;

  @ApiPropertyOptional({
    description: 'Reference for refund payment',
    example: 'TRX-2025-1206-001',
  })
  @Column({ name: 'refund_reference', nullable: true })
  refund_reference?: string;

  @ApiPropertyOptional({
    description: 'Date when refund was processed',
    example: '2025-12-03T17:00:00Z',
  })
  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refunded_at?: Date;

  @ApiPropertyOptional({
    description: 'Account from which refund was debited',
    example: 'ASSET.CASH',
  })
  @Column({ name: 'debit_account_code', nullable: true })
  debit_account_code?: string;

  @ApiProperty({
    description: 'Record creation time',
    example: '2025-12-03T12:00:00Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Record last update time',
    example: '2025-12-03T14:30:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Virtual property for refund transactions (not stored in database)
  @ApiPropertyOptional({
    description: 'Refund transaction history in simple format',
    type: 'array',
    isArray: true,
    example: [
      {
        id: 27,
        type: 'supplier_refund',
        amount: '75000.00',
        method: 'Cash',
        note: 'Money refund to supplier for Purchase Return #1',
        purchase_return_id: 1,
        debit_account_code: 'ASSET.CASH',
        credit_account_code: 'LIABILITY.SUPPLIER_ABC',
        created_at: '2025-12-06T01:46:32.879Z',
      },
    ],
  })
  refund_history?: any[];
}

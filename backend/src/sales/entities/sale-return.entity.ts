import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { SaleReturnItem } from './sale-return-item.entity';

@Entity('sale_returns')
export class SaleReturn {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Unique return number',
    example: 'SR-20251203-0001',
  })
  @Column({ unique: true })
  return_no: string;

  @ApiProperty({ description: 'Reference to original sale' })
  @Column({ name: 'sale_id' })
  sale_id: number;

  @ManyToOne(() => Sale, { nullable: false })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @ApiProperty({ description: 'Customer receiving the refund' })
  @Column({ name: 'customer_id' })
  customer_id: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'Warehouse from which items are returned' })
  @Column({ name: 'warehouse_id' })
  warehouse_id: number;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({ description: 'Branch where return is processed' })
  @Column({ name: 'branch_id' })
  branch_id: number;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiPropertyOptional({
    description: 'User who processed the return',
  })
  @Column({ name: 'processed_by_id', nullable: true })
  processed_by_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by_id' })
  processed_by?: User;

  @ApiProperty({ description: 'Items being returned' })
  @OneToMany(() => SaleReturnItem, (item) => item.sale_return, {
    cascade: true,
    eager: true,
  })
  items: SaleReturnItem[];

  @ApiProperty({
    description: 'Total return amount',
    example: 5000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @ApiProperty({
    description: 'Refund amount already paid',
    example: 3000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refunded_amount: number;

  @ApiProperty({
    description: 'Remaining refund amount',
    example: 2000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remaining_amount: number;

  @ApiPropertyOptional({
    description: 'Reason for return',
    example: 'Product damaged',
  })
  @Column({ nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'Return status',
    example: 'draft',
    enum: ['draft', 'approved', 'processed', 'cancelled'],
  })
  @Column({
    type: 'enum',
    enum: ['draft', 'approved', 'processed', 'cancelled'],
    default: 'draft',
  })
  status: 'draft' | 'approved' | 'processed' | 'cancelled';

  @ApiProperty({
    description: 'Refund method',
    example: 'cash',
    enum: ['cash', 'bank', 'mobile', 'store_credit', 'exchange'],
  })
  @Column({
    type: 'enum',
    enum: ['cash', 'bank', 'mobile', 'store_credit', 'exchange'],
    nullable: true,
  })
  refund_method?: 'cash' | 'bank' | 'mobile' | 'store_credit' | 'exchange';

  @ApiPropertyOptional({
    description: 'Notes about refund processing',
  })
  @Column({ type: 'text', nullable: true })
  refund_notes?: string;

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
}
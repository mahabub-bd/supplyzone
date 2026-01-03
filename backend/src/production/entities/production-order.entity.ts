import { ApiProperty } from '@nestjs/swagger';
import { Brand } from 'src/brand/entities/brand.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductionOrderItem } from './production-order-item.entity';

export enum ProductionOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum ProductionPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('production_orders')
export class ProductionOrder {
  @ApiProperty({
    description: 'Production Order ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Production Order number',
    example: 'PO-2025-001',
  })
  @Column({ unique: true })
  order_number: string;

  @ApiProperty({
    description: 'Production Order title/description',
    example: 'Samsung Galaxy S24 Production Batch',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the production order',
    example: 'Production of 1000 units of Samsung Galaxy S24',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Brand for this production order',
    type: () => Brand,
  })
  @Column({ name: 'brand_id', nullable: true })
  brand_id?: string;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand?: Brand;

  @Column({ name: 'warehouse_id' })
  warehouse_id: number;

  @ApiProperty({
    description: 'Target warehouse for completed products',
    type: () => Warehouse,
  })
  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiProperty({
    description: 'Production Order status',
    enum: ProductionOrderStatus,
    example: ProductionOrderStatus.IN_PROGRESS,
  })
  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.PENDING,
  })
  status: ProductionOrderStatus;

  @ApiProperty({
    description: 'Production priority',
    enum: ProductionPriority,
    example: ProductionPriority.NORMAL,
  })
  @Column({
    type: 'enum',
    enum: ProductionPriority,
    default: ProductionPriority.NORMAL,
  })
  priority: ProductionPriority;

  @ApiProperty({
    description: 'Planned start date',
    example: '2025-01-25T09:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  planned_start_date?: Date;

  @ApiProperty({
    description: 'Planned completion date',
    example: '2025-02-05T18:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  planned_completion_date?: Date;

  @ApiProperty({
    description: 'Actual start date',
    example: '2025-01-26T08:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  actual_start_date?: Date;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2025-02-04T16:45:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  actual_completion_date?: Date;

  @ApiProperty({
    description: 'Production order notes',
    example: 'Special packaging requirements',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Production order items',
    type: () => [ProductionOrderItem],
  })
  @OneToMany(() => ProductionOrderItem, (item) => item.productionOrder)
  items: ProductionOrderItem[];

  @Column({ name: 'created_by' })
  created_by: number;

  @ApiProperty({
    description: 'User who created the production order',
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by_user?: User;

  @Column({ name: 'assigned_to', nullable: true })
  assigned_to?: number;

  @ApiProperty({
    description: 'User assigned to this production order',
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assigned_to_user?: User;

  @ApiProperty({
    description: 'Date when production order was created',
    example: '2025-01-22T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date when production order was last updated',
    example: '2025-01-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    description: 'Date when production order was soft deleted',
    example: '2025-01-24T09:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deleted_at?: Date;
}
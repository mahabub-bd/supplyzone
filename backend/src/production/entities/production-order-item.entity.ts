import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductionOrder } from './production-order.entity';

export enum ProductionItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('production_order_items')
export class ProductionOrderItem {
  @ApiProperty({
    description: 'Production Order Item ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'production_order_id' })
  production_order_id: number;

  @ApiProperty({
    description: 'Production Order reference',
    type: () => ProductionOrder,
  })
  @ManyToOne(() => ProductionOrder, (order) => order.items)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @Column({ name: 'product_id' })
  product_id: number;

  @ApiProperty({
    description: 'Product to be manufactured',
    type: () => Product,
  })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'Recipe ID used for production',
    example: 1,
    required: false,
  })
  @Column({ name: 'recipe_id', nullable: true })
  recipe_id?: number;

  @ApiProperty({
    description: 'Planned quantity to produce',
    example: 1000,
  })
  @Column({ type: 'int' })
  planned_quantity: number;

  @ApiProperty({
    description: 'Actual quantity produced',
    example: 950,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  actual_quantity?: number;

  @ApiProperty({
    description: 'Quantity of good items (quality passed)',
    example: 920,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  good_quantity?: number;

  @ApiProperty({
    description: 'Quantity of defective items',
    example: 30,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  defective_quantity?: number;

  @ApiProperty({
    description: 'Unit cost per item',
    example: 450.50,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost?: number;

  @ApiProperty({
    description: 'Total estimated cost',
    example: 450500.00,
    required: false,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimated_cost?: number;

  @ApiProperty({
    description: 'Actual cost incurred',
    example: 438200.00,
    required: false,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  actual_cost?: number;

  @ApiProperty({
    description: 'Production notes or specifications',
    example: 'Premium version with additional features',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  specifications?: string;

  @ApiProperty({
    description: 'Quality control notes',
    example: 'All items passed initial QC inspection',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  quality_notes?: string;

  @ApiProperty({
    description: 'Production item status',
    enum: ProductionItemStatus,
    example: ProductionItemStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: ProductionItemStatus,
    default: ProductionItemStatus.PENDING,
  })
  status: ProductionItemStatus;

  @ApiProperty({
    description: 'Batch number for this production run',
    example: 'BATCH-S24-2025-001',
    required: false,
  })
  @Column({ nullable: true })
  batch_number?: string;

  @ApiProperty({
    description: 'Serial number range (if applicable)',
    example: 'SN001000-SN001950',
    required: false,
  })
  @Column({ nullable: true })
  serial_number_range?: string;

  @ApiProperty({
    description: 'Expiry date (if applicable)',
    example: '2028-01-31',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  @ApiProperty({
    description: 'Date when production order item was created',
    example: '2025-01-22T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date when production order item was last updated',
    example: '2025-01-25T14:30:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    description: 'Date when production order item was soft deleted',
    example: '2025-01-26T09:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deleted_at?: Date;
}
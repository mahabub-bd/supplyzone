import { ApiProperty } from '@nestjs/swagger';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { ProductionOrderItem } from './production-order-item.entity';
import { ProductionOrder } from './production-order.entity';
import { ProductionRecipeItem } from './production-recipe-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ConsumptionStatus {
  PLANNED = 'planned',
  RESERVED = 'reserved',
  CONSUMED = 'consumed',
  WASTED = 'wasted',
  RETURNED = 'returned',
}

@Entity('material_consumption')
export class MaterialConsumption {
  @ApiProperty({
    description: 'Material Consumption ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Production Order reference',
    type: () => ProductionOrder,
  })
  @Column({ name: 'production_order_id' })
  production_order_id: number;

  @ManyToOne(() => ProductionOrder)
  @JoinColumn({ name: 'production_order_id' })
  production_order: ProductionOrder;

  @ApiProperty({
    description: 'Production Order Item reference',
    type: () => ProductionOrderItem,
  })
  @Column({ name: 'production_order_item_id' })
  production_order_item_id: number;

  @ManyToOne(() => ProductionOrderItem)
  @JoinColumn({ name: 'production_order_item_id' })
  production_order_item: ProductionOrderItem;

  @ApiProperty({
    description: 'Recipe Item reference',
    type: () => ProductionRecipeItem,
  })
  @Column({ name: 'recipe_item_id' })
  recipe_item_id: number;

  @ManyToOne(() => ProductionRecipeItem)
  @JoinColumn({ name: 'recipe_item_id' })
  recipe_item: ProductionRecipeItem;

  @ApiProperty({
    description: 'Inventory batch where material was consumed from',
    type: () => Inventory,
  })
  @Column({ name: 'inventory_batch_id' })
  inventory_batch_id: number;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventory_batch_id' })
  inventory_batch: Inventory;

  @ApiProperty({
    description: 'Planned quantity to be consumed',
    example: 100,
  })
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  planned_quantity: number;

  @ApiProperty({
    description: 'Actual quantity consumed',
    example: 98,
    required: false,
  })
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  actual_quantity?: number;

  @ApiProperty({
    description: 'Wasted quantity',
    example: 2,
    required: false,
  })
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  wasted_quantity?: number;

  @ApiProperty({
    description: 'Unit cost of material at time of consumption',
    example: 15.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @ApiProperty({
    description: 'Total material cost',
    example: 1550.00,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_cost: number;

  @ApiProperty({
    description: 'Consumption status',
    enum: ConsumptionStatus,
    example: ConsumptionStatus.CONSUMED,
  })
  @Column({
    type: 'enum',
    enum: ConsumptionStatus,
    default: ConsumptionStatus.PLANNED,
  })
  status: ConsumptionStatus;

  @ApiProperty({
    description: 'Consumption date',
    example: '2025-01-26T14:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  consumption_date?: Date;

  @ApiProperty({
    description: 'Consumption notes',
    example: 'Materials consumed from batch #BATCH-123',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Date when consumption record was created',
    example: '2025-01-26T14:30:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;
}
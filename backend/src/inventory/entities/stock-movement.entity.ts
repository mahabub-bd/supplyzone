import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 👇 Define Enum for Stock Movement Type
export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
}

@Entity('inventory_movements')
export class StockMovement {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 12 })
  @Column()
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  @ApiProperty({ type: () => Product })
  product: Product;

  @ApiProperty({ example: 3 })
  @Column()
  warehouse_id: number;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  @ApiProperty({ type: () => Warehouse })
  warehouse: Warehouse;

  @ApiProperty({
    enum: StockMovementType,
    example: StockMovementType.IN,
    description: 'Type of inventory movement',
  })
  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @ApiProperty({ example: 50 })
  @Column()
  quantity: number;

  @ApiProperty({ example: 'Damaged items removed', nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true })
  from_warehouse_id?: number;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'from_warehouse_id' })
  from_warehouse?: Warehouse;

  @Column({ nullable: true })
  to_warehouse_id?: number;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'to_warehouse_id' })
  to_warehouse?: Warehouse;

  @ManyToOne(() => User, { nullable: true })
  @ApiProperty({ type: () => User, nullable: true })
  created_by?: User;

  @ApiProperty({ description: 'Timestamp of stock movement' })
  @CreateDateColumn()
  created_at: Date;
}

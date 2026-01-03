import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { PurchaseItem } from 'src/purchase-order/entities/purchase-item.entity';
import { User } from 'src/user/entities/user.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_batches')
export class Inventory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  /** PREVENT CIRCULAR REFERENCE */
  @ApiPropertyOptional({ description: 'Product ID', type: Number })
  @Column()
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiPropertyOptional({ type: Number })
  @Column()
  warehouse_id: number;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  batch_no?: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  sold_quantity: number;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true })
  expiry_date?: Date;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchase_price: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  supplier?: string;

  @ManyToOne(() => PurchaseItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_item_id' })
  purchase_item?: PurchaseItem;

  @Column({ nullable: true })
  purchase_item_id?: number;

  @ManyToOne(() => User, { nullable: true })
  created_by?: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

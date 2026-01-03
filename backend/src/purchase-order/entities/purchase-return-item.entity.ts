import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';
import { PurchaseReturn } from './purchase-return.entity';

@Entity('purchase_return_items')
export class PurchaseReturnItem {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Reference to purchase return' })
  @Column({ name: 'purchase_return_id' })
  purchase_return_id: number;

  @ManyToOne(() => PurchaseReturn, (pr) => pr.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_return_id' })
  purchase_return: PurchaseReturn;

  @ApiProperty({ description: 'Reference to original purchase item' })
  @Column({ name: 'purchase_item_id', nullable: true })
  purchase_item_id?: number;

  @ManyToOne(() => PurchaseItem, { nullable: true })
  @JoinColumn({ name: 'purchase_item_id' })
  purchase_item?: PurchaseItem;

  @ApiProperty({ description: 'Product being returned' })
  @Column({ name: 'product_id' })
  product_id: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'Quantity being returned',
    example: 10,
  })
  @Column({ type: 'int' })
  returned_quantity: number;

  @ApiProperty({
    description: 'Original purchase price per unit',
    example: 500.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Total line amount (quantity * price)',
    example: 5000.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  line_total: number;
}
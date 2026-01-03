import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { SaleReturn } from './sale-return.entity';

@Entity('sale_return_items')
export class SaleReturnItem {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Reference to sale return' })
  @Column({ name: 'sale_return_id' })
  sale_return_id: number;

  @ManyToOne(() => SaleReturn, (sr) => sr.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_return_id' })
  sale_return: SaleReturn;

  @ApiProperty({ description: 'Reference to original sale item' })
  @Column({ name: 'sale_item_id' })
  sale_item_id: number;

  @ManyToOne(() => SaleItem, { nullable: false })
  @JoinColumn({ name: 'sale_item_id' })
  sale_item: SaleItem;

  @ApiProperty({ description: 'Product being returned' })
  @Column({ name: 'product_id' })
  product_id: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'Quantity being returned',
    example: 2,
  })
  @Column({ type: 'int' })
  returned_quantity: number;

  @ApiProperty({
    description: 'Original sale price per unit',
    example: 1500.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @ApiProperty({
    description: 'Discount applied on return',
    example: 100.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @ApiProperty({
    description: 'Tax amount on return',
    example: 180.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({
    description: 'Total line amount (returned_quantity * unit_price - discount + tax)',
    example: 3080.0,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  line_total: number;

  @ApiProperty({
    description: 'Reason for returning this specific item',
    example: 'Defective product',
  })
  @Column({ nullable: true })
  return_reason?: string;

  @ApiProperty({
    description: 'Condition of returned item',
    example: 'good',
    enum: ['new', 'good', 'damaged', 'defective', 'missing_parts'],
  })
  @Column({
    type: 'enum',
    enum: ['new', 'good', 'damaged', 'defective', 'missing_parts'],
    nullable: true,
  })
  item_condition?: 'new' | 'good' | 'damaged' | 'defective' | 'missing_parts';
}
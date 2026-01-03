import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { Warehouse } from 'src/warehouse/entities/warehouse.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity('quotation_items')
export class QuotationItem {
  @ApiProperty({
    description: 'Unique identifier for the quotation item',
    example: 101,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quotation, (quotation) => quotation.items)
  quotation: Quotation;

  @ApiProperty({
    description: 'Product details',
    type: () => Product,
  })
  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({
    description: 'Warehouse details',
    type: () => Warehouse,
  })
  @ManyToOne(() => Warehouse)
  warehouse: Warehouse;

  @ApiProperty({
    description: 'Warehouse ID where product will be sourced from',
    example: 1,
  })
  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 5,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the product',
    example: 1200,
  })
  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2 })
  unit_price: number;

  @ApiProperty({
    description: 'Total price for this item (quantity × unit_price)',
    example: 6000,
  })
  @Column({ name: 'total_price', type: 'decimal', precision: 14, scale: 2 })
  total_price: number;

  @ApiPropertyOptional({
    description: 'Discount percentage for this item',
    example: 10,
  })
  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @ApiPropertyOptional({
    description: 'Discount amount for this item',
    example: 600,
  })
  @Column({ name: 'discount_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  discount_amount: number;

  @ApiPropertyOptional({
    description: 'Tax percentage for this item',
    example: 15,
  })
  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_percentage: number;

  @ApiPropertyOptional({
    description: 'Tax amount for this item',
    example: 810,
  })
  @Column({ name: 'tax_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  tax_amount: number;

  @ApiPropertyOptional({
    description: 'Net price after discount and tax',
    example: 6210,
  })
  @Column({ name: 'net_price', type: 'decimal', precision: 14, scale: 2 })
  net_price: number;

  @ApiPropertyOptional({
    description: 'Unit of measurement for the product',
    type: () => Unit,
  })
  @ManyToOne(() => Unit, { eager: true })
  unit?: Unit;

  @ApiPropertyOptional({
    description: 'Notes or comments about this specific item',
    example: 'Custom color option',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Item creation timestamp',
    example: '2025-11-26T14:10:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Item last updated timestamp',
    example: '2025-11-26T15:10:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
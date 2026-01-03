import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Purchase Item ID' })
  id: number;

  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  @ApiProperty({ type: () => Purchase, description: 'Purchase information' })
  purchase: Purchase;

  @Column()
  @ApiProperty({ description: 'Purchase ID' })
  purchase_id: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  @ApiProperty({ type: () => Product, description: 'Product information' })
  product: Product;

  @Column()
  @ApiProperty({ description: 'Product ID' })
  product_id: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Quantity ordered' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Quantity received so far' })
  quantity_received: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @ApiProperty({ description: 'Unit price' })
  unit_price?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0,
  })
  @ApiProperty({ description: 'Price (backward compatibility)' })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Discount amount per unit' })
  discount_per_unit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Tax rate percentage' })
  tax_rate: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: false
  })
  @ApiProperty({
    description:
      'Total price for this item (quantity × unit_price - discount + tax)',
  })
  total_price: number;

  @OneToMany(() => Inventory, (inventory) => inventory.purchase_item)
  @ApiPropertyOptional({
    type: () => [Inventory],
    description: 'Inventory batches from this purchase',
  })
  inventory_batches?: Inventory[];

  // Constructor for backward compatibility
  constructor(partial?: Partial<PurchaseItem>) {
    // Initialize default values
    this.quantity = 0;
    this.quantity_received = 0;
    this.price = 0;
    this.discount_per_unit = 0;
    this.tax_rate = 0;
    this.total_price = 0;

    if (partial) {
      // Only assign specific fields to avoid overriding explicit values
      if (partial.product_id !== undefined)
        this.product_id = partial.product_id;
      if (partial.quantity !== undefined) this.quantity = partial.quantity;
      if (partial.unit_price !== undefined)
        this.unit_price = partial.unit_price;
      if (partial.price !== undefined) this.price = partial.price;
      if (partial.discount_per_unit !== undefined)
        this.discount_per_unit = partial.discount_per_unit;
      if (partial.tax_rate !== undefined) this.tax_rate = partial.tax_rate;
      if (partial.total_price !== undefined)
        this.total_price = partial.total_price;
      if (partial.quantity_received !== undefined)
        this.quantity_received = partial.quantity_received;
      if (partial.purchase_id !== undefined)
        this.purchase_id = partial.purchase_id;

      // Ensure unit_price is set from price for backward compatibility
      if (partial.price !== undefined && !partial.unit_price) {
        this.unit_price = partial.price;
      }
    }
  }
}

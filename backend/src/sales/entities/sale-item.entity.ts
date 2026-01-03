import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' })
  sale: Sale;

  @ManyToOne(() => Product)
  product: Product;

  @Column('int')
  quantity: number;

  @Column('int')
  warehouse_id: number; // Option 2: provided per item

  @Column('numeric', { precision: 14, scale: 2 })
  unit_price: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  discount: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  tax: number;

  @Column('numeric', { precision: 14, scale: 2 })
  line_total: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Category } from 'src/category/entities/category.entity';
import { SubCategory } from 'src/category/entities/subcategory.entity';

import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from '../enums/product-type.enum';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Product unique ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiPropertyOptional()
  @Column({ nullable: true, unique: true })
  sku?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  barcode?: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  selling_price: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchase_price: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount_price?: number | null;

  @ApiProperty()
  @Column({ default: true })
  status: boolean;

  @ApiPropertyOptional({
    description: 'Product type for categorization in production',
    enum: ProductType,
    example: ProductType.RAW_MATERIAL,
  })
  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.FINISHED_GOOD,
    nullable: true,
  })
  product_type?: ProductType;

  @ApiPropertyOptional({ type: () => Brand })
  @ManyToOne(() => Brand, { nullable: true })
  brand?: Brand;

  @ApiPropertyOptional({ type: () => Category })
  @ManyToOne(() => Category, { nullable: true })
  category?: Category;

  @ApiPropertyOptional({ type: () => SubCategory })
  @ManyToOne(() => SubCategory, { nullable: true })
  subcategory?: SubCategory;

  @ApiPropertyOptional({ type: () => Unit })
  @ManyToOne(() => Unit, { nullable: true })
  unit?: Unit;

  @ApiPropertyOptional({ type: () => [Tag] })
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tag[];

  @ApiPropertyOptional({ type: () => [Attachment] })
  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'product_images',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attachment_id', referencedColumnName: 'id' },
  })
  images?: Attachment[];

  @ApiPropertyOptional({ type: () => Supplier })
  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @ApiPropertyOptional({
    description: 'Product origin/country of manufacture',
    example: 'China',
  })
  @Column({ type: 'text', nullable: true })
  origin?: string;

  @ApiPropertyOptional({
    description: 'Product expiration date',
    example: '2025-12-31',
  })
  @Column({ type: 'date', nullable: true })
  expire_date?: Date;

  /** IMPORTANT:
   * Do NOT expose Inventory fully. Only show minimal batch list to avoid circular loop.
   */
  @ApiPropertyOptional({
    description: 'Inventory batches',
    type: () => [Inventory],
  })
  @OneToMany(() => Inventory, (inv) => inv.product)
  inventories: Inventory[];

  @ManyToOne(() => User, { nullable: true })
  created_by?: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

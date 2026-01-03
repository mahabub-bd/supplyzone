import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { Unit } from 'src/unit/entities/unit.entity';
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
import { ProductionRecipe } from './production-recipe.entity';

export enum MaterialType {
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  CONSUMABLE = 'consumable',
  PACKAGING = 'packaging',
  SUB_ASSEMBLY = 'sub_assembly',
}

@Entity('production_recipe_items')
export class ProductionRecipeItem {
  @ApiProperty({
    description: 'Production Recipe Item ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recipe_id' })
  recipe_id: number;

  @ApiProperty({
    description: 'Production Recipe reference',
    type: () => ProductionRecipe,
  })
  @ManyToOne(() => ProductionRecipe, (recipe) => recipe.recipe_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: ProductionRecipe;

  @Column({ name: 'material_product_id' })
  material_product_id: number;

  @ApiProperty({
    description: 'Material/Product used in this recipe',
    type: () => Product,
  })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'material_product_id' })
  material_product: Product;

  @ApiProperty({
    description: 'Type of material',
    enum: MaterialType,
    example: MaterialType.COMPONENT,
  })
  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.RAW_MATERIAL,
  })
  material_type: MaterialType;

  @ApiProperty({
    description: 'Quantity of material required for standard recipe quantity',
    example: 5,
  })
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  required_quantity: number;

  @ApiProperty({
    description: 'Unit of measure for the material',
    type: () => Unit,
  })
  @Column({ name: 'unit_id', nullable: true })
  unit_id?: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit_of_measure?: Unit;

  @ApiProperty({
    description: 'Material consumption rate (%)',
    example: 2.5,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  consumption_rate?: number;

  @ApiProperty({
    description: 'Material waste percentage (%)',
    example: 1.0,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waste_percentage?: number;

  @ApiProperty({
    description: 'Material cost per unit',
    example: 15.50,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost?: number;

  @ApiProperty({
    description: 'Total material cost for standard quantity',
    example: 77.50,
    required: false,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_cost?: number;

  @ApiProperty({
    description: 'Material specifications or grade',
    example: 'Grade A electronic components',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  specifications?: string;

  @ApiProperty({
    description: 'Supplier requirements or preferred suppliers',
    example: 'Must source from approved electronic component suppliers',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  supplier_requirements?: string;

  @ApiProperty({
    description: 'Storage requirements for this material',
    example: 'Store in temperature-controlled environment',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  storage_requirements?: string;

  @ApiProperty({
    description: 'Quality control notes for this material',
    example: 'Must pass incoming inspection with no defects',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  quality_notes?: string;

  @ApiProperty({
    description: 'Material priority in recipe',
    example: 1,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  priority?: number;

  @ApiProperty({
    description: 'Whether this material is optional',
    example: false,
    default: false,
  })
  @Column({ default: false })
  is_optional: boolean;

  @ApiProperty({
    description: 'Alternative materials that can be used (comma-separated product IDs)',
    example: '123,124,125',
    required: false,
  })
  @Column({ nullable: true })
  alternative_materials?: string;

  @ApiProperty({
    description: 'Material notes and instructions',
    example: 'Handle with care, avoid ESD damage',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Date when recipe item was created',
    example: '2025-01-22T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date when recipe item was last updated',
    example: '2025-01-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    description: 'Date when recipe item was soft deleted',
    required: false,
  })
  @DeleteDateColumn()
  deleted_at?: Date;
}
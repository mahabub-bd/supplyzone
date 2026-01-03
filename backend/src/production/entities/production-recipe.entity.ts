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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductionRecipeItem } from './production-recipe-item.entity';

export enum RecipeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum RecipeType {
  MANUFACTURING = 'manufacturing',
  ASSEMBLY = 'assembly',
  PROCESSING = 'processing',
}

@Entity('production_recipes')
export class ProductionRecipe {
  @ApiProperty({
    description: 'Production Recipe ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Recipe name',
    example: 'Samsung Galaxy S24 Manufacturing Recipe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Recipe code or SKU',
    example: 'RECIPE-SG-S24-001',
  })
  @Column({ unique: true })
  recipe_code: string;

  @ApiProperty({
    description: 'Product this recipe produces',
    type: () => Product,
  })
  @Column({ name: 'finished_product_id' })
  finished_product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'finished_product_id' })
  finished_product: Product;

  @ApiProperty({
    description: 'Detailed description of the recipe',
    example: 'Complete manufacturing process for Samsung Galaxy S24 including all components and materials',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Recipe version',
    example: '1.0',
    default: '1.0',
  })
  @Column({ default: '1.0' })
  version: string;

  @ApiProperty({
    description: 'Type of recipe',
    enum: RecipeType,
    example: RecipeType.MANUFACTURING,
  })
  @Column({
    type: 'enum',
    enum: RecipeType,
    default: RecipeType.MANUFACTURING,
  })
  recipe_type: RecipeType;

  @ApiProperty({
    description: 'Recipe status',
    enum: RecipeStatus,
    example: RecipeStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: RecipeStatus,
    default: RecipeStatus.DRAFT,
  })
  status: RecipeStatus;

  @ApiProperty({
    description: 'Standard quantity produced by this recipe',
    example: 1000,
  })
  @Column({ type: 'int', default: 1 })
  standard_quantity: number;

  @ApiProperty({
    description: 'Unit of measure for standard quantity',
    type: () => Unit,
  })
  @Column({ name: 'unit_id', nullable: true })
  unit_id?: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @ApiProperty({
    description: 'Estimated production time in minutes',
    example: 480,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  estimated_time_minutes?: number;

  @ApiProperty({
    description: 'Recipe instructions and steps',
    example: '1. Prepare PCB\n2. Mount components\n3. Test functionality\n4. Apply casing',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @ApiProperty({
    description: 'Quality control requirements',
    example: 'All components must pass QC inspection before assembly',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  quality_requirements?: string;

  @ApiProperty({
    description: 'Safety notes and warnings',
    example: 'Use ESD protection when handling electronic components',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  safety_notes?: string;

  @ApiProperty({
    description: 'Recipe materials/ingredients',
    type: () => [ProductionRecipeItem],
  })
  @OneToMany(() => ProductionRecipeItem, (item) => item.recipe, {
    cascade: true,
  })
  recipe_items: ProductionRecipeItem[];

  @ApiProperty({
    description: 'Yield percentage (0-100)',
    example: 95.5,
    required: false,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  yield_percentage?: number;

  @ApiProperty({
    description: 'Effective date for this recipe version',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  effective_date?: Date;

  @ApiProperty({
    description: 'Expiry date for this recipe version',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  @ApiProperty({
    description: 'Additional recipe metadata',
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Date when recipe was created',
    example: '2025-01-22T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date when recipe was last updated',
    example: '2025-01-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    description: 'Date when recipe was soft deleted',
    required: false,
  })
  @DeleteDateColumn()
  deleted_at?: Date;
}
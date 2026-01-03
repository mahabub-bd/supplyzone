import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Account } from 'src/account/entities/account.entity';
import { Product } from 'src/product/entities/product.entity';
import { Purchase } from 'src/purchase-order/entities/purchase.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @ApiProperty({
    example: 1,
    description: 'Unique supplier ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Techno Distributors Ltd.',
    description: 'Name of the supplier',
  })
  @Column()
  name: string;
  @ApiProperty({
    example: 'SUP-001',
    description: 'Unique supplier reference code',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  supplier_code: string;

  @ApiPropertyOptional({
    example: 'Mahabub Hossain',
    description: 'Primary contact person for the supplier',
  })
  @Column({ nullable: true })
  contact_person?: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description: 'Supplier phone number',
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({
    example: 'supplier@example.com',
    description: 'Supplier email address',
  })
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional({
    example: '123/4B, Barishal Sadar, Barishal, Bangladesh',
    description: 'Supplier full address',
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({
    example: 'Net 30 days',
    description: 'Payment terms or agreement with supplier',
  })
  @Column({ nullable: true })
  payment_terms?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the supplier is active or inactive',
  })
  @Column({ default: true })
  status: boolean;

  @ApiPropertyOptional({
    description: 'Products supplied by this supplier',
    type: () => [Product],
  })
  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
  @ApiPropertyOptional({
    description: 'Supplier payable account',
    type: () => Account,
  })
  @OneToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account?: Account;
  @ApiPropertyOptional({
    description: 'Purchase history of the supplier',
    type: () => [Purchase],
  })
  @OneToMany(() => Purchase, (purchase) => purchase.supplier)
  purchase_history: Purchase[];

  @ApiProperty({
    example: '2025-11-20T14:30:00.000Z',
    description: 'Record creation timestamp',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2025-11-20T14:30:00.000Z',
    description: 'Record update timestamp',
  })
  @UpdateDateColumn()
  updated_at: Date;
}

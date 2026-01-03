import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Account } from 'src/account/entities/account.entity';
import { CustomerGroup } from 'src/customer-group/entities/customer-group.entity';
import { Sale } from 'src/sales/entities/sale.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingAddress } from './billing-address.entity';
import { ShippingAddress } from './shipping-address.entity';

@Entity('customers')
export class Customer {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'CUS-001', description: 'Unique customer code' })
  @Column({ type: 'varchar', length: 20, unique: true })
  customer_code: string;

  @ApiProperty({ example: 'Mahabub Hossain' })
  @Column()
  name: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({ example: 'customer@mail.com' })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  status: boolean;

  @ApiProperty({ example: 0, description: 'Reward points earned by customer' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reward_points: number;

  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @Column({ nullable: true })
  account_id?: number;

  @ApiPropertyOptional({
    description: 'Customer group this customer belongs to',
    type: () => CustomerGroup,
  })
  @ManyToOne(() => CustomerGroup, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: CustomerGroup;

  @Column({ nullable: true })
  group_id?: number;

  // 🔥 NEW — Customer → Sales Relation
  @ApiPropertyOptional({
    description: 'All sales made by this customer',
    type: () => [Sale],
  })
  @OneToMany(() => Sale, (sale) => sale.customer)
  sales: Sale[];

 

  @ApiPropertyOptional({
    description: 'Billing address for this customer',
    type: () => BillingAddress,
  })
  @OneToOne(() => BillingAddress, (billingAddress) => billingAddress.customer, {
    cascade: true,
  })
  billing_address?: BillingAddress;

  @ApiPropertyOptional({
    description: 'Shipping address for this customer',
    type: () => ShippingAddress,
  })
  @OneToOne(
    () => ShippingAddress,
    (shippingAddress) => shippingAddress.customer,
    { cascade: true },
  )
  shipping_address?: ShippingAddress;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer } from 'src/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('billing_addresses')
export class BillingAddress {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Contact person name' })
  @Column({ nullable: true })
  contact_name?: string;

  @ApiProperty({ example: '01700000000', description: 'Contact phone number' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ example: '123 Main Street', description: 'Street address' })
  @Column()
  street: string;

  @ApiProperty({ example: 'Dhaka', description: 'City name' })
  @Column()
  city: string;



  @ApiProperty({ example: 'Bangladesh', description: 'Country name' })
  @Column()
  country: string;

  @ApiPropertyOptional({
    description: 'Customer this billing address belongs to',
    type: () => Customer,
  })
  @OneToOne(() => Customer, (customer) => customer.billing_address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id', unique: true })
  customer_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
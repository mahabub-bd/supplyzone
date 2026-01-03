import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Purchase } from 'src/purchase-order/entities/purchase.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentType {
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  method: 'cash' | 'bank' | 'mobile';

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @Column({ nullable: true })
  supplier_id?: number;

  @ManyToOne(() => Purchase, { nullable: true })
  @JoinColumn({ name: 'purchase_id' })
  purchase?: Purchase;

  @Column({ nullable: true })
  purchase_id?: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ nullable: true })
  customer_id?: number;

  @ManyToOne(() => Sale, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale?: Sale;

  @Column({ nullable: true })
  sale_id?: number;

  @CreateDateColumn()
  created_at: Date;
}

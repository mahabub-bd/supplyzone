import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_payments')
export class SalePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (s) => s.payments, { onDelete: 'CASCADE' })
  sale: Sale;

  @Column({ length: 50 })
  method: string; // cash|bank|mobile|due

  @Column('numeric', { precision: 14, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  account_code?: string; // e.g. 'ASSET.CASH' or 'ASSET.BANK_IBBL'

  @Column({ nullable: true })
  reference?: string;

  @CreateDateColumn()
  created_at: Date;
}

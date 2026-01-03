import { Branch } from 'src/branch/entities/branch.entity';
import { ExpenseCategory } from 'src/expense-category/entities/expense-category.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethodEnum {
  CASH = 'cash',
  BANK = 'bank',
  MOBILE = 'mobile',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column('numeric', { precision: 14, scale: 2, nullable: false })
  amount: number;

  // Expense Category Relation
  @ManyToOne(() => ExpenseCategory, { eager: true })
  @JoinColumn({ name: 'category_id' }) // <-- Explicit FK
  category: ExpenseCategory;

  @Column({ nullable: false })
  category_id: number;

  @Column({ nullable: true })
  receipt_url?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.CASH,
  })
  payment_method: PaymentMethodEnum;

  @Column({ type: 'varchar', length: 50, nullable: true })
  account_code?: string;

  @ManyToOne(() => Branch, { eager: true })
  @JoinColumn({ name: 'branch_id' }) // <-- Explicit FK
  branch: Branch;

  @Column({ nullable: false })
  branch_id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' }) // <-- Explicit FK
  created_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CashRegister } from './cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('cash_register_transactions')
export class CashRegisterTransaction {
  @ApiProperty({
    description: 'Unique ID of the cash register transaction',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Cash register where this transaction occurred',
    type: () => CashRegister,
  })
  @ManyToOne(() => CashRegister, { nullable: false })
  @JoinColumn({ name: 'cash_register_id' })
  cash_register: CashRegister;

  @ApiProperty({
    description: 'Type of transaction',
    enum: ['sale', 'refund', 'cash_in', 'cash_out', 'opening_balance', 'closing_balance'],
    example: 'sale',
  })
  @Column({ type: 'varchar', length: 20 })
  transaction_type: 'sale' | 'refund' | 'cash_in' | 'cash_out' | 'opening_balance' | 'closing_balance';

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 1500,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Payment method used',
    enum: ['cash', 'card', 'bank', 'mobile'],
    example: 'cash',
  })
  @Column({ type: 'varchar', length: 20, default: 'cash' })
  payment_method: 'cash' | 'card' | 'bank' | 'mobile';

  @ApiPropertyOptional({
    description: 'Associated sale (for sale and refund transactions)',
    type: () => Sale,
  })
  @ManyToOne(() => Sale, { nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale?: Sale;

  @ApiProperty({
    description: 'User who performed this transaction',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Cash sale - Invoice INV-20251211-0001',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Running balance after this transaction',
    example: 11500,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  running_balance: number;

  @ApiPropertyOptional({
    description: 'Reference number for the transaction',
    example: 'INV-20251211-0001',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_no?: string;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-12-11T10:30:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;
}
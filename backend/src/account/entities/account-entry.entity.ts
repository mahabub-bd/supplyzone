import { ApiProperty } from '@nestjs/swagger';
import { AccountTransaction } from './account-transaction.entity';
import { Account } from './account.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('account_entries')
export class AccountEntry {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AccountTransaction, (t) => t.entries)
  @JoinColumn({ name: 'transaction_id' })
  transaction: AccountTransaction;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  debit: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  credit: number;

  @ApiProperty()
  @Column({ nullable: true })
  narration?: string;
}

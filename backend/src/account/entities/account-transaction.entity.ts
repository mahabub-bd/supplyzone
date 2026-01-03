import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntry } from './account-entry.entity';

@Entity('account_transactions')
export class AccountTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  reference_type: string; // 'payment' | 'purchase' | 'sale'

  @ApiProperty()
  @Column()
  reference_id: number;

  @OneToMany(() => AccountEntry, (e) => e.transaction, { cascade: true })
  entries: AccountEntry[];

  @CreateDateColumn()
  created_at: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEntry } from './account-entry.entity';

@Entity('accounts')
export class Account {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  account_number?: string;

  @ApiProperty({ example: 'ASSET.CASH' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ example: 'Cash in Hand' })
  @Column()
  name: string;

  @ApiProperty({ example: 'asset' })
  @Column({
    type: 'enum',
    enum: ['asset', 'liability', 'equity', 'income', 'expense'],
  })
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';

  // 🚀 NEW PROPERTIES
  @ApiProperty({ example: true, required: false })
  @Column({ type: 'boolean', default: false })
  isCash: boolean;

  @ApiProperty({ example: false, required: false })
  @Column({ type: 'boolean', default: false })
  isBank: boolean;
  @ApiProperty({ example: false, required: false })
  @Column({ type: 'boolean', default: false })
  isCustomer: boolean;

  @OneToMany(() => AccountEntry, (e) => e.account)
  entries: AccountEntry[];
}

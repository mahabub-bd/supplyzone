import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CashRegisterTransaction } from './cash-register-transaction.entity';

@Entity('cash_registers')
export class CashRegister {
  @ApiProperty({
    description: 'Unique ID of the cash register',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name/Identifier of the cash register',
    example: 'Main Counter',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the cash register location or purpose',
    example: 'Front desk cash register for main branch',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Branch where this cash register is located',
    type: () => Branch,
  })
  @ManyToOne(() => Branch, { nullable: false })
  branch: Branch;

  @ApiProperty({
    description: 'Current status of the cash register',
    enum: ['open', 'closed', 'maintenance'],
    example: 'open',
  })
  @Column({ type: 'varchar', length: 20, default: 'closed' })
  status: 'open' | 'closed' | 'maintenance';

  @ApiProperty({
    description: 'Current balance in the cash register',
    example: 50000,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  current_balance: number;

  @ApiProperty({
    description: 'Opening balance for the current shift',
    example: 10000,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  opening_balance: number;

  @ApiPropertyOptional({
    description: 'User who currently opened this cash register',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  opened_by?: User;

  @ApiPropertyOptional({
    description: 'Date and time when the cash register was opened',
    example: '2025-12-11T09:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  opened_at?: Date;

  @ApiPropertyOptional({
    description: 'User who closed this cash register',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  closed_by?: User;

  @ApiPropertyOptional({
    description: 'Date and time when the cash register was closed',
    example: '2025-12-11T18:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  closed_at?: Date;

  @ApiPropertyOptional({
    description: 'Expected cash amount based on sales',
    example: 45000,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  expected_amount?: number;

  @ApiPropertyOptional({
    description: 'Actual cash amount counted',
    example: 44950,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  actual_amount?: number;

  @ApiPropertyOptional({
    description: 'Difference between expected and actual amount',
    example: -50,
  })
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  variance?: number;

  @ApiPropertyOptional({
    description: 'Notes about the cash register shift or variance',
    example: 'Shortage due to cash refund',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Transactions associated with this cash register',
    type: () => [CashRegisterTransaction],
  })
  @OneToMany(() => CashRegisterTransaction, (transaction) => transaction.cash_register)
  transactions: CashRegisterTransaction[];

  @ApiProperty({
    description: 'Cash register creation timestamp',
    example: '2025-12-11T08:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Cash register last updated timestamp',
    example: '2025-12-11T18:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
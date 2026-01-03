import { ApiProperty } from '@nestjs/swagger';
import { PayrollRecord } from './payroll-record.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PayrollItemType {
  ALLOWANCE = 'allowance',
  DEDUCTION = 'deduction',
  BONUS = 'bonus',
  OVERTIME = 'overtime',
  TAX = 'tax',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

@Entity('payroll_items')
export class PayrollItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'enum', enum: PayrollItemType })
  @ApiProperty({ enum: PayrollItemType })
  type: PayrollItemType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty()
  percentage: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  description: string;

  @ManyToOne(() => PayrollRecord, (payroll) => payroll.payroll_items, { eager: false })
  @ApiProperty()
  payroll_record: PayrollRecord;

  @CreateDateColumn()
  created_at: Date;
}
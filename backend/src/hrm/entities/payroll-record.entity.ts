import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { Employee } from './employee.entity';
import { PayrollItem } from './payroll-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet',
}

@Entity('payroll_records')
export class PayrollRecord {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  pay_period_start: Date;

  @Column()
  @ApiProperty()
  pay_period_end: Date;

  @Column({ type: 'date' })
  @ApiProperty()
  payment_date: Date;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.DRAFT })
  @ApiProperty({ enum: PayrollStatus })
  status: PayrollStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @ApiProperty({ enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  base_salary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  overtime_hours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  overtime_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  overtime_pay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  allowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  bonuses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  tax: number;

  
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  other_deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  gross_salary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  net_salary: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  payment_reference: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;

  @ManyToOne(() => Employee, (employee) => employee.payroll_records, { eager: false })
  @ApiProperty()
  employee: Employee;

  @ManyToOne(() => Branch, (branch) => branch.id, { eager: false })
  branch: Branch;

  @OneToMany(() => PayrollItem, (item) => item.payroll_record)
  payroll_items: PayrollItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
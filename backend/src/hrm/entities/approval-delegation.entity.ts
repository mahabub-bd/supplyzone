import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';
import { Employee } from './employee.entity';

export enum DelegationType {
  LEAVE_APPROVAL = 'leave_approval',
  PAYROLL_APPROVAL = 'payroll_approval',
  ATTENDANCE_APPROVAL = 'attendance_approval',
  EXPENSE_APPROVAL = 'expense_approval',
}

@Entity('approval_delegations')
export class ApprovalDelegation {
  @ApiProperty({ description: 'ID of the delegation' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, { lazy: true })
  @JoinColumn({ name: 'delegatorId' })
  delegator: Employee;

  @Column({ type: 'int' })
  delegatorId: number;

  @ManyToOne(() => Employee, { lazy: true })
  @JoinColumn({ name: 'delegateeId' })
  delegatee: Employee;

  @Column({ type: 'int' })
  delegateeId: number;

  @ApiProperty({
    description: 'Type of approval being delegated',
    enum: DelegationType,
  })
  @Column({ type: 'enum', enum: DelegationType })
  delegationType: DelegationType;

  @ApiProperty({ description: 'Start date of delegation' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'End date of delegation' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiProperty({ description: 'Reason for delegation' })
  @Column({ type: 'text', nullable: true })
  reason: string;

  @ApiProperty({ description: 'Is delegation currently active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Can this delegation be used multiple times' })
  @Column({ type: 'boolean', default: true })
  isReusable: boolean;

  @ApiProperty({ description: 'Maximum number of approvals can be delegated' })
  @Column({ type: 'int', nullable: true })
  maxApprovals: number;

  @ApiProperty({ description: 'Number of approvals used so far' })
  @Column({ type: 'int', default: 0 })
  usedApprovals: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'int' })
  branch_id: number;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deleted at' })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}

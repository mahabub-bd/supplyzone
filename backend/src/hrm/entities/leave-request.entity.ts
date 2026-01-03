import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { Employee } from './employee.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveApproval } from './leave-approval.entity';

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  COMPASSIONATE = 'compassionate',
  STUDY = 'study',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'date' })
  @ApiProperty()
  start_date: Date;

  @Column({ type: 'date' })
  @ApiProperty()
  end_date: Date;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  days_count: number;

  @Column({ type: 'enum', enum: LeaveType })
  @ApiProperty({ enum: LeaveType })
  leave_type: LeaveType;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  @ApiProperty({ enum: LeaveStatus })
  status: LeaveStatus;

  @Column({ type: 'text' })
  @ApiProperty()
  reason: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  rejection_reason: string;

  @Column({ type: 'date', nullable: true })
  @ApiProperty()
  approved_date: Date;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  approver_notes: string;

  @ManyToOne(() => Employee, { eager: false })
  @ApiProperty()
  employee: Employee;

  @ManyToOne(() => Branch, (branch) => branch.id, { eager: false })
  branch: Branch;

  @OneToMany(() => LeaveApproval, (approval) => approval.leaveRequest)
  approvals: LeaveApproval[];

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  currentApproverId: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  currentApprovalLevel: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  totalApprovalLevels: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  completedApprovalLevels: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isFullyApproved: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  requiresMultiLevelApproval: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

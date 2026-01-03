import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { Employee } from './employee.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

export enum ApprovalLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  FINAL = 99,
}

@Entity('leave_approvals')
export class LeaveApproval {
  @ApiProperty({ description: 'ID of the approval record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Leave request being approved' })
  @ManyToOne(() => LeaveRequest, { eager: false })
  @JoinColumn({ name: 'leaveRequestId' })
  leaveRequest: LeaveRequest;

  @ApiProperty({ description: 'Leave request ID' })
  @Column({ type: 'int' })
  leaveRequestId: number;

  @ApiProperty({ description: 'Approver employee' })
  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'approverId' })
  approver: Employee;

  @ApiProperty({ description: 'Approver employee ID' })
  @Column({ type: 'int' })
  approverId: number;

  @ApiProperty({ description: 'Approval level', enum: ApprovalLevel })
  @Column({ type: 'int' })
  approvalLevel: ApprovalLevel;

  @ApiProperty({ description: 'Current status of approval', enum: ApprovalStatus })
  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @ApiProperty({ description: 'Is this auto-approved based on rules' })
  @Column({ type: 'boolean', default: false })
  isAutoApproved: boolean;

  @ApiProperty({ description: 'Date when approval was made' })
  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @ApiProperty({ description: 'Comments from approver' })
  @Column({ type: 'text', nullable: true })
  approverComments: string;

  @ApiProperty({ description: 'Reason for rejection if rejected' })
  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @ApiProperty({ description: 'Original approver before delegation', type: () => Employee })
  @ManyToOne(() => Employee, { nullable: true, lazy: true })
  @JoinColumn({ name: 'originalApproverId' })
  originalApprover: Employee;

  @ApiProperty({ description: 'Original approver ID (before delegation)' })
  @Column({ type: 'int', nullable: true })
  originalApproverId: number;

  @ApiProperty({ description: 'Is this the final approval' })
  @Column({ type: 'boolean', default: false })
  isFinalApproval: boolean;

  @ApiProperty({ description: 'Minimum approval level required' })
  @Column({ type: 'int', nullable: true })
  minRequiredLevel: number;

  @ApiProperty({ description: 'Approval sequence number' })
  @Column({ type: 'int', default: 1 })
  sequence: number;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
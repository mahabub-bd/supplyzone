import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';
import { Attendance } from './attendance.entity';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { LeaveRequest } from './leave-request.entity';
import { PayrollRecord } from './payroll-record.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated', // Company-initiated termination
  RESIGNED = 'resigned', // Employee-initiated resignation
  ON_LEAVE = 'on_leave',
}

export enum EmployeeType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty()
  employee_code: string;

  @Column()
  @ApiProperty()
  first_name: string;

  @Column()
  @ApiProperty()
  last_name: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ nullable: true })
  @ApiProperty()
  phone: string;

  @Column({ nullable: true })
  @ApiProperty()
  address: string;

  @Column({ type: 'date', nullable: true })
  @ApiProperty()
  date_of_birth: Date;

  @Column({ type: 'date' })
  @ApiProperty()
  hire_date: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  @ApiProperty({ enum: Gender })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  @ApiProperty()
  termination_date: Date;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  @ApiProperty({ enum: EmployeeStatus })
  status: EmployeeStatus;

  @Column({ type: 'enum', enum: EmployeeType, default: EmployeeType.FULL_TIME })
  @ApiProperty({ enum: EmployeeType })
  employee_type: EmployeeType;

  @ManyToOne(() => Department, (department) => department.employees, {
    eager: true,
  })
  @JoinColumn({ name: 'departmentId' })
  @ApiProperty()
  department: Department;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  departmentId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @ApiProperty()
  base_salary: number;

  @ManyToOne(() => Branch, { eager: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  @ApiProperty()
  user: User;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  userId: number;

  @ManyToOne(() => Designation, { eager: true, nullable: true })
  @JoinColumn({ name: 'designationId' })
  @ApiProperty()
  designation: Designation;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  designationId: number;

  @ManyToOne(() => Employee, { nullable: true, lazy: true })
  @JoinColumn({ name: 'reportingManagerId' })
  reportingManager: Employee;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  reportingManagerId: number;

  @OneToMany(() => Employee, (employee) => employee.reportingManager, {
    lazy: true,
  })
  subordinates: Employee[];

  // @OneToMany(() => ApprovalDelegation, (delegation) => delegation.delegator, { lazy: true })
  // delegationsGiven: ApprovalDelegation[];

  // @OneToMany(() => ApprovalDelegation, (delegation) => delegation.delegatee, { lazy: true })
  // delegationsReceived: ApprovalDelegation[];

  @OneToMany(() => PayrollRecord, (payroll) => payroll.employee)
  payroll_records: PayrollRecord[];

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendance_records: Attendance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leave_requests: LeaveRequest[];

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;

  // Virtual property for full name
  @ApiProperty({ readOnly: true })
  get name(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

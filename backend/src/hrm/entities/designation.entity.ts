import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../hrm/entities/employee.entity';

export enum DesignationLevel {
  JUNIOR_OFFICER = 'junior_officer',
  OFFICER = 'officer',
  SENIOR_OFFICER = 'senior_officer',
  EXECUTIVE = 'executive',
  SENIOR_EXECUTIVE = 'senior_executive',
  ASSISTANT_MANAGER = 'assistant_manager',
  MANAGER = 'manager',
  SENIOR_MANAGER = 'senior_manager',
  HEAD_OF_DEPARTMENT = 'head_of_department',
  HEAD_OF_HR='head_of_hr',
  CFO = 'cfo',
  CTO = 'cto',
  CIO = 'cio',
  COO = 'coo',
  CEO = 'ceo',
  DIRECTOR = 'director',
  MANAGING_DIRECTOR = 'managing_director',
}

@Entity('designations')
export class Designation {
  @ApiProperty({ description: 'ID of the designation' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Title of the designation' })
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ApiProperty({ description: 'Code for the designation' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({
    description: 'Level of the designation',
    enum: DesignationLevel,
  })
  @Column({ type: 'enum', enum: DesignationLevel })
  level: DesignationLevel;

  @ApiProperty({ description: 'Description of the designation role' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Minimum salary for this designation' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary: number;

  @ApiProperty({ description: 'Maximum salary for this designation' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary: number;

  @ApiProperty({ description: 'Maximum leave days that can be auto-approved' })
  @Column({ type: 'int', nullable: true, default: 2 })
  autoApproveLeaveDays: number;

  @ApiProperty({ description: 'Can approve leave requests' })
  @Column({ type: 'boolean', default: false })
  canApproveLeave: boolean;

  @ApiProperty({ description: 'Can approve payroll' })
  @Column({ type: 'boolean', default: false })
  canApprovePayroll: boolean;

  @ApiProperty({
    description: 'Parent designation for hierarchy',
    type: () => Designation,
  })
  @ManyToOne(() => Designation, { nullable: true })
  @JoinColumn({ name: 'parentDesignationId' })
  parentDesignation: Designation;

  @ApiProperty({ description: 'Parent designation ID' })
  @Column({ type: 'int', nullable: true })
  parentDesignationId: number;

  @ApiProperty({ description: 'Child designations', type: () => [Designation] })
  @OneToMany(() => Designation, (designation) => designation.parentDesignation)
  childDesignations: Designation[];

  @ApiProperty({ description: 'Employees with this designation' })
  @OneToMany(() => Employee, (employee) => employee.designation)
  employees: Employee[];

  @ApiProperty({ description: 'Is this designation active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

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

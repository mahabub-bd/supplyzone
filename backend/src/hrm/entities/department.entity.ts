import { ApiProperty } from '@nestjs/swagger';
import { Employee } from './employee.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ example: 'Engineering' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Software development and IT support' })
  description?: string;

  @Column({ type: 'enum', enum: DepartmentStatus, default: DepartmentStatus.ACTIVE })
  @ApiProperty({ enum: DepartmentStatus })
  status: DepartmentStatus;

  @Column({ nullable: true })
  @ApiProperty({ example: '001' })
  code?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Department manager' })
  manager_name?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'manager@company.com' })
  manager_email?: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Additional department notes' })
  notes?: string;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
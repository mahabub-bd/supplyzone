import { ApiProperty } from '@nestjs/swagger';
import { Branch } from 'src/branch/entities/branch.entity';
import { Employee } from './employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: string;

  @Column({ type: 'date' })
  @ApiProperty()
  date: Date;

  @Column({ type: 'time', nullable: true })
  @ApiProperty()
  check_in: Date;

  @Column({ type: 'time', nullable: true })
  @ApiProperty()
  check_out: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty()
  regular_hours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @ApiProperty()
  overtime_hours: number;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @ApiProperty({ enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;

  @ManyToOne(() => Employee, { eager: false })
  @ApiProperty()
  employee: Employee;

  @ManyToOne(() => Branch, (branch) => branch.id, { eager: false })
  branch: Branch;

  @CreateDateColumn()
  created_at: Date;
}
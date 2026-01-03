import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  PROCESS = 'PROCESS',
  CANCEL = 'CANCEL',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  PRINT = 'PRINT',
}

export enum AuditModule {
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  INVENTORY = 'INVENTORY',
  ACCOUNTING = 'ACCOUNTING',
  CUSTOMERS = 'CUSTOMERS',
  SUPPLIERS = 'SUPPLIERS',
  USERS = 'USERS',
  PRODUCTS = 'PRODUCTS',
  WAREHOUSES = 'WAREHOUSES',
  BRANCHES = 'BRANCHES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  AUTH = 'AUTH',
}

@Entity('audit_trails')
@Index(['user_id'])
@Index(['module'])
@Index(['action'])
@Index(['entity_id'])
@Index(['created_at'])
export class AuditTrail {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User who performed the action' })
  @Column({ name: 'user_id', nullable: true })
  user_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ApiProperty({ description: 'Username for quick reference' })
  @Column({ length: 100, nullable: true })
  username?: string;

  @ApiProperty({
    description: 'Action performed',
    enum: AuditAction,
    example: 'CREATE',
  })
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({
    description: 'Module where action occurred',
    enum: AuditModule,
    example: 'SALES',
  })
  @Column({
    type: 'enum',
    enum: AuditModule,
  })
  module: AuditModule;

  @ApiProperty({
    description: 'Entity type that was affected',
    example: 'Sale',
  })
  @Column({ length: 50 })
  entity_type: string;

  @ApiProperty({
    description: 'ID of the entity that was affected',
    example: 123,
  })
  @Column({ name: 'entity_id', nullable: true })
  entity_id?: number;

  @ApiProperty({
    description: 'Entity identifier (invoice number, code, etc.)',
    example: 'INV-20251203-0001',
  })
  @Column({ name: 'entity_identifier', length: 100, nullable: true })
  entity_identifier?: string;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.100',
  })
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address?: string;

  @ApiProperty({
    description: 'User agent/browser information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent?: string;

  @ApiProperty({
    description: 'Old values before change (for UPDATE actions)',
  })
  @Column({ name: 'old_values', type: 'json', nullable: true })
  old_values?: any;

  @ApiProperty({
    description: 'New values after change (for CREATE/UPDATE actions)',
  })
  @Column({ name: 'new_values', type: 'json', nullable: true })
  new_values?: any;

  @ApiProperty({
    description: 'Description of the action performed',
    example: 'Created new sale for customer John Doe',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Additional metadata or context',
  })
  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @ApiProperty({
    description: 'Whether the action was successful',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  success: boolean;

  @ApiProperty({
    description: 'Error message if action failed',
    nullable: true,
  })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @ApiProperty({
    description: 'Duration of the operation in milliseconds',
    nullable: true,
  })
  @Column({ name: 'duration_ms', nullable: true })
  duration_ms?: number;

  @ApiProperty({
    description: 'Record creation time',
    example: '2025-12-03T12:00:00Z',
  })
  @CreateDateColumn()
  created_at: Date;
}
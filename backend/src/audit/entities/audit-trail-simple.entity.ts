import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

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
@Index(['created_at'])
export class AuditTrail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  user_id?: number;

  @Column({ length: 100, nullable: true })
  username?: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditModule })
  module: AuditModule;

  @Column({ length: 50, default: 'Unknown' })
  entity_type: string;

  @Column({ name: 'entity_id', nullable: true })
  entity_id?: number;

  @Column({ name: 'entity_identifier', length: 100, nullable: true })
  entity_identifier?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent?: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  old_values?: any;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  new_values?: any;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @Column({ type: 'boolean', default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ name: 'duration_ms', nullable: true })
  duration_ms?: number;

  @CreateDateColumn()
  created_at: Date;
}
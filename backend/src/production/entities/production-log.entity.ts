import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductionOrder } from './production-order.entity';

export enum ProductionLogType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  PRODUCTION_STARTED = 'production_started',
  PRODUCTION_PAUSED = 'production_paused',
  PRODUCTION_RESUMED = 'production_resumed',
  PRODUCTION_COMPLETED = 'production_completed',
  QUALITY_CHECK = 'quality_check',
  MATERIAL_USED = 'material_used',
  ISSUE_REPORTED = 'issue_reported',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed',
}

@Entity('production_logs')
export class ProductionLog {
  @ApiProperty({
    description: 'Production Log ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Production Order reference',
    type: () => ProductionOrder,
  })
  @Column({ name: 'production_order_id' })
  production_order_id: number;

  @ManyToOne(() => ProductionOrder)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @ApiProperty({
    description: 'Type of production activity',
    enum: ProductionLogType,
    example: ProductionLogType.PRODUCTION_STARTED,
  })
  @Column({
    type: 'enum',
    enum: ProductionLogType,
  })
  log_type: ProductionLogType;

  @ApiProperty({
    description: 'Log message/description',
    example: 'Production started for batch BATCH-S24-2025-001',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    description: 'Additional data in JSON format',
    example: '{"batch_number": "BATCH-S24-2025-001", "operator": "John Doe"}',
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'user_id', nullable: true })
  user_id?: number;

  @ApiProperty({
    description: 'User who performed the action',
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.100',
    required: false,
  })
  @Column({ nullable: true })
  ip_address?: string;

  @ApiProperty({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @ApiProperty({
    description: 'Date when the log was created',
    example: '2025-01-22T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;
}
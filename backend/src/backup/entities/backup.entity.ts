import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BackupType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
}

@Entity('backups')
export class Backup {
  @ApiProperty({ example: 1, description: 'Backup ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'backup-2025-12-30-143026.sql', description: 'Backup file name' })
  @Column({ nullable: true })
  file_name: string;

  @ApiProperty({ example: 'https://smart-salepos.s3.ap-southeast-1.amazonaws.com/backups/backup-2025-12-30-143026.sql', description: 'S3 file URL' })
  @Column({ nullable: true })
  s3_url: string;

  @ApiProperty({ example: 'ap-southeast-1', description: 'S3 region' })
  @Column({ nullable: true })
  s3_region: string;

  @ApiProperty({ example: 'smart-salepos', description: 'S3 bucket name' })
  @Column({ nullable: true })
  s3_bucket: string;

  @ApiProperty({ example: 2048576, description: 'File size in bytes' })
  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @ApiProperty({ enum: BackupType, example: BackupType.SCHEDULED, description: 'Backup type' })
  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.MANUAL,
  })
  backup_type: BackupType;

  @ApiProperty({ enum: BackupStatus, example: BackupStatus.COMPLETED, description: 'Backup status' })
  @Column({
    type: 'enum',
    enum: BackupStatus,
    default: BackupStatus.PENDING,
  })
  status: BackupStatus;

  @ApiProperty({ example: 'Database backup completed successfully', description: 'Status message or error' })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({ example: 'mahabub', description: 'User who triggered the backup (if manual)' })
  @Column({ nullable: true })
  created_by: string;

  @ApiProperty({ example: '2025-12-30T14:30:26.000Z', description: 'Backup creation timestamp' })
  @CreateDateColumn()
  created_at: Date;
}

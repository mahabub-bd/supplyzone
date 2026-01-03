import { ApiProperty } from '@nestjs/swagger';
import { BackupStatus, BackupType } from '../entities/backup.entity';

export class BackupResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'backup-2025-12-30-143026.sql' })
  file_name: string;

  @ApiProperty({ example: 'https://smart-salepos.s3.ap-southeast-1.amazonaws.com/backups/backup-2025-12-30-143026.sql' })
  s3_url: string;

  @ApiProperty({ example: 'ap-southeast-1' })
  s3_region: string;

  @ApiProperty({ example: 'smart-salepos' })
  s3_bucket: string;

  @ApiProperty({ example: 2048576 })
  file_size: number;

  @ApiProperty({ enum: BackupType, example: BackupType.SCHEDULED })
  backup_type: BackupType;

  @ApiProperty({ enum: BackupStatus, example: BackupStatus.COMPLETED })
  status: BackupStatus;

  @ApiProperty({ example: 'Database backup completed successfully' })
  message: string;

  @ApiProperty({ example: 'mahabub' })
  created_by: string;

  @ApiProperty({ example: '2025-12-30T14:30:26.000Z' })
  created_at: Date;
}

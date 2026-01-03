import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BackupType } from '../entities/backup.entity';

export class CreateBackupDto {
  @ApiPropertyOptional({
    enum: BackupType,
    description: 'Type of backup (manual or scheduled)',
    example: BackupType.MANUAL,
  })
  @IsOptional()
  @IsEnum(BackupType)
  backup_type?: BackupType;

  @ApiPropertyOptional({
    description: 'Optional description or notes for this backup',
    example: 'Backup before major system update',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

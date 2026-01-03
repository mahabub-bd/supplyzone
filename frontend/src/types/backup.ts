import { TimestampFields } from ".";

// ============================================================================
// BACKUP TYPES & ENUMS
// ============================================================================

export type BackupStatus = "pending" | "in_progress" | "completed" | "failed";

// ============================================================================
// BACKUP RESPONSE
// ============================================================================

export interface Backup extends TimestampFields {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  status: BackupStatus;
  created_by: string;
  completed_at?: string;
  error_message?: string;
  s3_key?: string;
  s3_url?: string;
}

export interface BackupResponseDto {
  id: number;
  file_name: string;
  s3_url: string;
  s3_region: string;
  s3_bucket: string;
  file_size: number;
  backup_type: string;
  status: BackupStatus;
  message: string;
  created_by: string;
  created_at: string;
}

// ============================================================================
// SCHEDULER STATUS
// ============================================================================

export interface SchedulerStatus {
  enabled: boolean;
  schedule: string;
  description: string;
  nextRun: string;
  timeZone: string;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

export interface CreateBackupDto {
  description?: string;
}

// ============================================================================
// FILTER PARAMS
// ============================================================================

export interface ListBackupsParams {
  page?: number;
  limit?: number;
  status?: BackupStatus;
}
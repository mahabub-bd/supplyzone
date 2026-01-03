# Database Backup Module

## Overview

This module provides automated PostgreSQL database backups with S3 storage integration. It supports both manual and scheduled backups.

## Features

- ✅ PostgreSQL database dumps using `pg_dump`
- ✅ Automatic upload to AWS S3
- ✅ Manual backup triggering via API
- ✅ Scheduled automatic backups (default: daily at 2 AM)
- ✅ Backup status tracking (pending, in_progress, completed, failed)
- ✅ Backup history and metadata management
- ✅ Reuses existing S3 configuration from attachment module

## Prerequisites

### PostgreSQL Installation

**Windows:**
- Install PostgreSQL 14, 15, or 16
- The service automatically detects `pg_dump` in:
  - `C:\Program Files\PostgreSQL\{version}\bin\`
  - `C:\PostgreSQL\{version}\bin\`

**Linux/Mac:**
- PostgreSQL is usually installed at `/usr/bin/pg_dump` or `/usr/local/bin/pg_dump`

### Environment Variables

Ensure these are set in your `.env` file:

```env
# Database Configuration
DATABASE_HOST=your_host
DATABASE_PORT=5432
DATABASE_NAME=your_database
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password

# AWS S3 Configuration (already configured for attachment module)
AWS_REGION=ap-southeast-1
AWS_S3_ACCESS_KEY=your_access_key
AWS_S3_SECRET_KEY=your_secret_key
AWS_S3_BUCKET_NAME=smart-salepos
```

## Database Table

The module creates a `backups` table:

```sql
CREATE TABLE backups (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  s3_url VARCHAR(1000) NOT NULL,
  s3_region VARCHAR(50),
  s3_bucket VARCHAR(255),
  file_size BIGINT,
  backup_type VARCHAR(20) DEFAULT 'manual',
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Base URL: `/backup`

All endpoints require JWT authentication.

### 1. Create Manual Backup

```http
POST /backup
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "file_name": "backup-2025-12-30-143026.sql",
  "s3_url": "https://smart-salepos.s3.ap-southeast-1.amazonaws.com/backups/backup-2025-12-30-143026.sql",
  "status": "pending",
  "backup_type": "manual",
  "created_at": "2025-12-30T14:30:26.000Z"
}
```

### 2. Get All Backups

```http
GET /backup
Authorization: Bearer {token}
```

### 3. Get Latest Backup

```http
GET /backup/latest
Authorization: Bearer {token}
```

### 4. Get Backup by ID

```http
GET /backup/:id
Authorization: Bearer {token}
```

### 5. Delete Backup Record

```http
DELETE /backup/:id
Authorization: Bearer {token}
```

**Note:** This only deletes the database record. The S3 file is preserved for safety.

## Backup Process

### Automatic Backup Flow

1. **Scheduled Trigger** (default: daily at 2 AM)
   - `BackupSchedulerService.handleDailyBackup()` is triggered
2. **Database Dump**
   - `pg_dump` creates SQL dump file
   - File stored temporarily in `temp/` directory
3. **S3 Upload**
   - Backup file uploaded to `{bucket}/backups/{filename}`
4. **Record Update**
   - Database record updated with status and S3 URL
5. **Cleanup**
   - Temporary file deleted from local storage

### Backup Status Lifecycle

```
pending → in_progress → completed
                    ↘ failed
```

## Scheduling

### Default Schedule

Backups run automatically every day at **2:00 AM**.

### Customize Schedule

Edit `src/backup/backup-scheduler.ts`:

```typescript
// Every 6 hours
@Cron(CronExpression.EVERY_6_HOURS)

// Every Sunday at midnight
@Cron('0 0 * * 0')

// Custom cron expression
@Cron('0 2 * * *')  // Daily at 2 AM
```

## Backup File Storage

### Local Storage (Temporary)

- Path: `{project_root}/temp/`
- Files are deleted after successful S3 upload

### S3 Storage (Permanent)

- Path: `{bucket}/backups/`
- File naming: `backup-{timestamp}.sql`
- Example: `backup-2025-12-30-143026.sql`

## Usage Examples

### Manual Backup via cURL

```bash
curl -X POST http://localhost:3000/backup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Manual Backup via Swagger

1. Navigate to `http://localhost:3000/docs`
2. Authenticate with `/auth/login`
3. Go to `POST /backup`
4. Click "Try it out"
5. Execute

### View Backup Status

```bash
# Get latest backup
curl http://localhost:3000/backup/latest \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all backups
curl http://localhost:3000/backup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Common Issues

**1. "pg_dump not found"**
- Ensure PostgreSQL is installed
- Check PATH environment variable
- Windows: Add PostgreSQL bin to PATH
- Linux/Mac: `sudo apt-get install postgresql-client`

**2. S3 Upload Failed**
- Verify AWS credentials in `.env`
- Check S3 bucket exists
- Ensure IAM user has `s3:PutObject` permissions

**3. Database Connection Failed**
- Verify database is running
- Check connection credentials
- Ensure database exists

## Monitoring

### Check Backup Logs

The service logs each backup step:

```
[BackupService] Creating database dump with command...
[BackupService] Database dump created successfully
[BackupService] Uploading backup to S3...
[BackupService] Backup completed successfully
```

### Monitoring via Database

```sql
-- View recent backups
SELECT * FROM backups ORDER BY created_at DESC LIMIT 10;

-- Check failed backups
SELECT * FROM backups WHERE status = 'failed';

-- Backup statistics
SELECT
  status,
  COUNT(*) as count,
  AVG(file_size) as avg_size
FROM backups
GROUP BY status;
```

## Security Considerations

1. **S3 Bucket Policy**: Restrict access to backup files
2. **IAM Permissions**: Use least-privilege access
3. **Encryption**: Enable S3 bucket encryption
4. **Retention**: Implement backup retention policy
5. **Access Control**: Only authenticated users can trigger backups

## Maintenance

### Cleanup Old Backups

Implement a cleanup job to remove old backup records:

```typescript
@Cron(CronExpression.EVERY_WEEK)
async cleanupOldBackups() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await this.backupRepository.delete({
    created_at: LessThan(thirtyDaysAgo),
  });
}
```

## Troubleshooting

### Backup Status Stuck at "in_progress"

Check application logs for errors. Possible causes:
- Database connection timeout
- S3 upload failure
- Disk space issues

### Large Database Performance

For large databases (> 1GB):
- Consider compression: `pg_dump -F c`
- Use multipart upload to S3
- Schedule during low-traffic hours

## Development

### Testing Backup Manually

```typescript
// In your controller or test
const backup = await backupService.createManualBackup('test-user');
console.log('Backup initiated:', backup.id);
```

### Disabling Scheduled Backups

Comment out the `@Cron` decorator in `backup-scheduler.ts`:

```typescript
// @Cron(CronExpression.EVERY_DAY_AT_2AM)
async handleDailyBackup() {
  // Disabled
}
```

## Support

For issues or questions:
1. Check application logs
2. Verify environment configuration
3. Test S3 connection separately
4. Verify pg_dump works independently

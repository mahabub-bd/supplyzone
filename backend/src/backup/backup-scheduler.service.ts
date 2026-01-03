import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupSchedulerService {
  private readonly logger = new Logger(BackupSchedulerService.name);

  constructor(private readonly backupService: BackupService) {
    this.logger.log('Backup scheduler initialized');
    this.logger.log('Schedule: Every day at 2:00 AM');
  }

  /**
   * PRIMARY SCHEDULE
   * Run automatic database backup every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-backup',
    timeZone: process.env.TZ || 'UTC',
  })
  async handleDailyBackup() {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('🔄 Starting scheduled daily backup...');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    try {
      const backup = await this.backupService.createScheduledBackup();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      this.logger.log('✅ Scheduled backup completed successfully');
      this.logger.log(`📦 Backup ID: ${backup.id}`);
      this.logger.log(`📄 File: ${backup.file_name}`);
      this.logger.log(`⏱️  Duration: ${duration}s`);
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Scheduled backup failed after ${duration}s:`, error);
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }

  /**
   * OPTIONAL: Weekly backup on Sunday at midnight
   * Uncomment to enable weekly full backup
   */
  // @Cron('0 0 * * 0', {
  //   name: 'weekly-backup',
  //   timeZone: process.env.TZ || 'UTC',
  // })
  // async handleWeeklyBackup() {
  //   this.logger.log('Starting weekly backup (Sunday)...');
  //   try {
  //     await this.backupService.createScheduledBackup();
  //     this.logger.log('Weekly backup completed successfully');
  //   } catch (error) {
  //     this.logger.error('Weekly backup failed:', error);
  //   }
  // }

  /**
   * OPTIONAL: Hourly backup (for critical systems)
   * Uncomment to enable hourly backups
   */
  // @Cron(CronExpression.EVERY_HOUR, {
  //   name: 'hourly-backup',
  //   timeZone: process.env.TZ || 'UTC',
  // })
  // async handleHourlyBackup() {
  //   this.logger.log('Starting hourly backup...');
  //   try {
  //     await this.backupService.createScheduledBackup();
  //     this.logger.log('Hourly backup completed successfully');
  //   } catch (error) {
  //     this.logger.error('Hourly backup failed:', error);
  //   }
  // }

  /**
   * OPTIONAL: Every 6 hours (4 times daily)
   * Uncomment to enable 6-hourly backups
   */
  // @Cron(CronExpression.EVERY_6_HOURS, {
  //   name: 'six-hourly-backup',
  //   timeZone: process.env.TZ || 'UTC',
  // })
  // async handleSixHourlyBackup() {
  //   this.logger.log('Starting 6-hourly backup...');
  //   try {
  //     await this.backupService.createScheduledBackup();
  //     this.logger.log('6-hourly backup completed successfully');
  //   } catch (error) {
  //     this.logger.error('6-hourly backup failed:', error);
  //   }
  // }

  /**
   * Manual trigger for testing/ad-hoc backups
   * Same as automatic scheduled backup
   */
  async triggerManualScheduledBackup() {
    this.logger.log('🚀 Manually triggering scheduled backup...');
    return this.backupService.createScheduledBackup();
  }

  /**
   * Get scheduler configuration
   */
  getSchedulerInfo() {
    return {
      enabled: true,
      schedule: '0 0 2 * * *',
      description: 'Every day at 2:00 AM',
      timeZone: process.env.TZ || 'UTC',
      nextRun: this.getNextRunTime(),
    };
  }

  /**
   * Calculate next scheduled backup time
   */
  private getNextRunTime(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);

    return tomorrow.toISOString();
  }
}

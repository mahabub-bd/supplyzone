import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupController } from './backup.controller';
import { BackupScheduleController } from './backup-schedule.controller';
import { BackupSchedulerService } from './backup-scheduler.service';
import { BackupService } from './backup.service';
import { Backup } from './entities/backup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Backup]),
    ScheduleModule.forRoot(),
  ],
  controllers: [BackupController, BackupScheduleController],
  providers: [BackupService, BackupSchedulerService],
  exports: [BackupService],
})
export class BackupModule {}

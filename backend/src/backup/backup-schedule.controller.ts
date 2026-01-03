import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { BackupSchedulerService } from './backup-scheduler.service';
import { BackupResponseDto } from './dto/backup-response.dto';

@ApiTags('Backup Schedule')
@Controller('backup/schedule')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('token')
export class BackupScheduleController {
  constructor(private readonly schedulerService: BackupSchedulerService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger scheduled backup',
    description: 'Triggers the same backup process that runs automatically',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled backup triggered successfully',
    type: BackupResponseDto,
  })
  async triggerScheduledBackup(): Promise<BackupResponseDto> {
    const backup = await this.schedulerService.triggerManualScheduledBackup();
    return backup as unknown as BackupResponseDto;
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get scheduler status',
    description: 'Returns information about the backup scheduler',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduler status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          example: true,
        },
        schedule: {
          type: 'string',
          example: '0 0 2 * * *',
          description: 'Cron expression (every day at 2 AM)',
        },
        description: {
          type: 'string',
          example: 'Every day at 2:00 AM',
        },
        nextRun: {
          type: 'string',
          example: '2025-12-31T02:00:00.000Z',
          description: 'Next scheduled backup time',
        },
        timeZone: {
          type: 'string',
          example: 'UTC',
        },
      },
    },
  })
  getSchedulerStatus() {
    return this.schedulerService.getSchedulerInfo();
  }
}

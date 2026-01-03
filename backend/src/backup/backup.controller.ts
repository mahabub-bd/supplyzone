import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { BackupService } from './backup.service';
import { BackupResponseDto } from './dto/backup-response.dto';
import { CreateBackupDto } from './dto/create-backup.dto';

@ApiTags('Database Backup')
@Controller('backup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('token')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual database backup',
    description: 'Creates a PostgreSQL database dump and uploads it to S3',
  })
  @ApiResponse({
    status: 201,
    description: 'Backup initiated successfully',
    type: BackupResponseDto,
  })
  async createManualBackup(
    @Param() params: CreateBackupDto,
  ): Promise<BackupResponseDto> {
    // For now, we'll use 'admin' as created_by. In real implementation,
    // you would get this from JWT token: req.user.username
    const backup = await this.backupService.createManualBackup('admin');
    return backup as unknown as BackupResponseDto;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all backups',
    description: 'Returns a list of all database backups with their status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of backups retrieved successfully',
    type: [BackupResponseDto],
  })
  async getAllBackups(): Promise<BackupResponseDto[]> {
    const backups = await this.backupService.getAllBackups();
    return backups as unknown as BackupResponseDto[];
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get latest completed backup',
    description: 'Returns the most recent successfully completed backup',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest backup retrieved successfully',
    type: BackupResponseDto,
  })
  async getLatestBackup(): Promise<BackupResponseDto | null> {
    const backup = await this.backupService.getLatestBackup();
    return backup as unknown as BackupResponseDto;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get backup by ID',
    description: 'Returns details of a specific backup',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup retrieved successfully',
    type: BackupResponseDto,
  })
  async getBackupById(@Param('id') id: string): Promise<BackupResponseDto> {
    const backup = await this.backupService.getBackupById(+id);
    return backup as unknown as BackupResponseDto;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete backup record',
    description:
      'Deletes the backup record from database. Note: The S3 file is not deleted for safety reasons.',
  })
  @ApiResponse({
    status: 204,
    description: 'Backup record deleted successfully',
  })
  async deleteBackupRecord(@Param('id') id: string): Promise<void> {
    await this.backupService.deleteBackupRecord(+id);
  }
}

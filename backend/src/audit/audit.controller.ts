import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { AuditService } from './audit.service';
import { AuditAction, AuditModule } from './entities/audit-trail-simple.entity';

@ApiTags('Audit')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('entity/:entityType/:entityId')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit trail for a specific entity' })
  @ApiOkResponse({ description: 'Audit trail retrieved successfully' })
  async getEntityAuditTrail(
    @Query('entityType') entityType: string,
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('limit', ParseIntPipe) limit = 100,
  ) {
    return this.auditService.findByEntity(entityType, entityId, limit);
  }

  @Get('module/:module')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit trail for a module' })
  @ApiOkResponse({ description: 'Module audit trail retrieved successfully' })
  async getModuleAuditTrail(
    @Query('module') module: AuditModule,
    @Query('action') action?: AuditAction,
    @Query('limit', ParseIntPipe) limit = 100,
  ) {
    return this.auditService.findByModule(module, action, limit);
  }

  @Get('user/:userId')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit trail for a user' })
  @ApiOkResponse({ description: 'User audit trail retrieved successfully' })
  async getUserAuditTrail(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit', ParseIntPipe) limit = 100,
  ) {
    return this.auditService.findByUser(userId, limit);
  }

  @Get('daterange')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit trail by date range' })
  @ApiOkResponse({ description: 'Date range audit trail retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditTrailByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('limit', ParseIntPipe) limit = 1000,
  ) {
    return this.auditService.findByDateRange(startDate, endDate, limit);
  }

  @Get('stats')
  @Permissions('audit.view')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiOkResponse({ description: 'Audit statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getAuditStats(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.auditService.getAuditStats(startDate, endDate);
  }
}
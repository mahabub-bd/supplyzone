import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository, Between } from 'typeorm';
import { AuditAction, AuditModule, AuditTrail } from './entities/audit-trail-simple.entity';

export interface AuditLogOptions {
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId?: number;
  entityIdentifier?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  success?: boolean;
  errorMessage?: string;
  durationMs?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditTrail)
    private auditRepo: Repository<AuditTrail>,
  ) {}

  async log(
    userId: number | null,
    username: string | null,
    ip: string | null,
    userAgent: string | null,
    options: AuditLogOptions,
  ): Promise<AuditTrail> {
    const auditLog = this.auditRepo.create({
      user_id: userId,
      username,
      ip_address: ip,
      user_agent: userAgent,
      // Ensure required fields have default values
      entity_type: options.entityType || 'Unknown',
      action: options.action || 'VIEW',
      module: options.module || 'SETTINGS',
      success: options.success !== undefined ? options.success : true,
      ...options,
    });

    return this.auditRepo.save(auditLog);
  }

  async logWithRequest(
    request: Request | null,
    userId: number | null,
    username: string | null,
    options: AuditLogOptions,
  ): Promise<AuditTrail> {
    const ip = this.getClientIp(request);
    const userAgent = this.getUserAgent(request);

    return this.log(userId, username, ip, userAgent, options);
  }

  async findByEntity(
    entityType: string,
    entityId: number,
    limit = 100,
  ): Promise<AuditTrail[]> {
    return this.auditRepo.find({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByModule(
    module: AuditModule,
    action?: AuditAction,
    limit = 100,
  ): Promise<AuditTrail[]> {
    const where: any = { module };
    if (action) where.action = action;

    return this.auditRepo.find({
      where,
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByUser(
    userId: number,
    limit = 100,
  ): Promise<AuditTrail[]> {
    return this.auditRepo.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 1000,
  ): Promise<AuditTrail[]> {
    return this.auditRepo.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getAuditStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const query = this.auditRepo.createQueryBuilder('audit');

    if (startDate && endDate) {
      query.where('audit.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalActions = await query.getCount();

    const actionsByModule = await query
      .select('audit.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.module')
      .getRawMany();

    const actionsByType = await query
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const successRate = await query
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN audit.success = true THEN 1 ELSE 0 END)', 'successful')
      .getRawOne();

    return {
      totalActions,
      actionsByModule,
      actionsByType,
      successRate: {
        total: successRate.total,
        successful: successRate.successful,
        successPercentage: successRate.total > 0
          ? (successRate.successful / successRate.total) * 100
          : 0,
      },
    };
  }

  private getClientIp(request: Request | null): string | null {
    if (!request) return null;

    const xForwardedFor = request.headers['x-forwarded-for'] as string;
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0]?.trim() || null;
    }

    const xRealIp = request.headers['x-real-ip'] as string;
    if (xRealIp) return xRealIp;

    return request.ip || request.connection.remoteAddress || null;
  }

  private getUserAgent(request: Request | null): string | null {
    if (!request) return null;
    return request.headers['user-agent'] || null;
  }
}
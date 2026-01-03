import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction, AuditModule } from './entities/audit-trail-simple.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Skip audit for health checks and static files
    if (this.shouldSkipAudit(request)) {
      return next.handle();
    }

    const { user } = request as any;
    const userId = user?.id || user?.sub || null; // JWT tokens often use 'sub' for user ID
    const username = user?.username || user?.name || user?.email || String(userId) || null;

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          this.logRequest(context, request, userId, username, true, null, duration, responseData);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logRequest(
            context,
            request,
            userId,
            username,
            false,
            error.message,
            duration,
            null,
          );
        },
      }),
    );
  }

  private shouldSkipAudit(request: Request): boolean {
    const skipPatterns = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/robots.txt',
      '/docs',
      '/swagger-ui',
      '/assets/',
      '/static/',
    ];

    return skipPatterns.some(pattern => request.path?.startsWith(pattern));
  }

  private logRequest(
    context: ExecutionContext,
    request: Request,
    userId: number | null,
    username: string | null,
    success: boolean,
    errorMessage: string | null,
    durationMs: number,
    responseData: any = null,
  ) {
    const { method, path, body, query } = request;

    // Extract route information
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    // Determine module and action based on route
    const module = this.determineModule(path);
    const action = this.determineAction(method, handler);

    // Create audit description
    const description = this.createDescription(
      method,
      path,
      handler,
      success,
    );

    // Extract entity information from request and response
    const entityInfo = this.extractEntityInfo(method, path, body, responseData);

    // For UPDATE operations, try to get old values (this would need repository access)
    let oldValues = null;
    if (method === 'PUT' || method === 'PATCH') {
      oldValues = this.extractOldValues(body, responseData);
    }

    const newValues = this.sanitizeData(body);

    this.auditService.logWithRequest(request, userId, username, {
      action,
      module,
      entityType: entityInfo.entityType,
      entityId: entityInfo.entityId,
      entityIdentifier: entityInfo.entityIdentifier,
      description,
      oldValues: oldValues,
      newValues: newValues,
      metadata: {
        method,
        path,
        query: this.sanitizeData(query),
        controller,
        handler,
        responseData: this.sanitizeData(responseData),
      },
      success,
      errorMessage: errorMessage || undefined,
      durationMs,
    });
  }

  private determineModule(path: string): AuditModule {
    const moduleMap: Record<string, AuditModule> = {
      '/sales': AuditModule.SALES,
      '/purchases': AuditModule.PURCHASES,
      '/inventory': AuditModule.INVENTORY,
      '/account': AuditModule.ACCOUNTING,
      '/customers': AuditModule.CUSTOMERS,
      '/suppliers': AuditModule.SUPPLIERS,
      '/users': AuditModule.USERS,
      '/products': AuditModule.PRODUCTS,
      '/warehouses': AuditModule.WAREHOUSES,
      '/branches': AuditModule.BRANCHES,
      '/reports': AuditModule.REPORTS,
      '/settings': AuditModule.SETTINGS,
      '/auth': AuditModule.AUTH,
    };

    // Try exact matching first
    for (const [route, module] of Object.entries(moduleMap)) {
      if (path.startsWith(route)) {
        return module;
      }
    }

    // Check for product-related keywords in the path
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes('product')) {
      return AuditModule.PRODUCTS;
    }
    if (lowerPath.includes('sale')) {
      return AuditModule.SALES;
    }
    if (lowerPath.includes('purchase')) {
      return AuditModule.PURCHASES;
    }
    if (lowerPath.includes('customer')) {
      return AuditModule.CUSTOMERS;
    }
    if (lowerPath.includes('supplier')) {
      return AuditModule.SUPPLIERS;
    }
    if (lowerPath.includes('user')) {
      return AuditModule.USERS;
    }
    if (lowerPath.includes('inventory')) {
      return AuditModule.INVENTORY;
    }
    if (lowerPath.includes('warehouse')) {
      return AuditModule.WAREHOUSES;
    }
    if (lowerPath.includes('branch')) {
      return AuditModule.BRANCHES;
    }
    if (lowerPath.includes('account')) {
      return AuditModule.ACCOUNTING;
    }
    if (lowerPath.includes('report')) {
      return AuditModule.REPORTS;
    }
    if (lowerPath.includes('auth')) {
      return AuditModule.AUTH;
    }

    return AuditModule.SETTINGS;
  }

  private determineAction(method: string, handler: string): AuditAction {
    const actionMap: Record<string, AuditAction> = {
      GET: AuditAction.VIEW,
      POST: AuditAction.CREATE,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    // Special cases for specific handlers
    if (handler?.includes('approve')) return AuditAction.APPROVE;
    if (handler?.includes('reject')) return AuditAction.REJECT;
    if (handler?.includes('process')) return AuditAction.PROCESS;
    if (handler?.includes('cancel')) return AuditAction.CANCEL;
    if (handler?.includes('login')) return AuditAction.LOGIN;
    if (handler?.includes('logout')) return AuditAction.LOGOUT;
    if (handler?.includes('export')) return AuditAction.EXPORT;
    if (handler?.includes('import')) return AuditAction.IMPORT;
    if (handler?.includes('print')) return AuditAction.PRINT;

    return actionMap[method] || AuditAction.VIEW;
  }

  private createDescription(
    method: string,
    path: string,
    handler: string,
    success: boolean,
  ): string {
    const status = success ? 'Successfully' : 'Failed to';
    const action = this.getActionName(method, handler);
    const resource = this.getResourceName(path);

    return `${status} ${action} ${resource}`;
  }

  private getActionName(method: string, handler: string): string {
    if (handler?.includes('approve')) return 'approve';
    if (handler?.includes('reject')) return 'reject';
    if (handler?.includes('process')) return 'process';
    if (handler?.includes('cancel')) return 'cancel';
    if (handler?.includes('export')) return 'export';
    if (handler?.includes('import')) return 'import';
    if (handler?.includes('print')) return 'print';

    const methodMap: Record<string, string> = {
      GET: 'view',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    return methodMap[method] || 'access';
  }

  private getResourceName(path: string): string {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'resource';

    const resource = segments[0];
    if (/^\d+$/.test(segments[1])) {
      return `${resource} with ID ${segments[1]}`;
    }

    return resource;
  }

  private extractEntityInfo(method: string, path: string, body: any, responseData: any) {
    const segments = path.split('/').filter(Boolean);
    const resource = segments[0] || 'Unknown';

    const entityInfo = {
      entityType: this.getEntityType(resource),
      entityId: undefined as number | undefined,
      entityIdentifier: undefined as string | undefined,
    };

    // Extract ID from path (for /products/123 style URLs)
    if (segments[1] && /^\d+$/.test(segments[1])) {
      entityInfo.entityId = parseInt(segments[1]);
    }

    // Extract ID from response data
    if (responseData?.id) {
      entityInfo.entityId = responseData.id;
    }

    // Extract ID from request body (for POST operations)
    if (body?.id && !entityInfo.entityId) {
      entityInfo.entityId = body.id;
    }

    // Extract identifier from response data with more field options
    const identifierFields = [
      'invoice_no', 'code', 'sku', 'barcode', 'reference',
      'name', 'title', 'email', 'username', 'product_name'
    ];

    for (const field of identifierFields) {
      if (responseData?.[field]) {
        entityInfo.entityIdentifier = responseData[field];
        break;
      }
    }

    // If not found in response, check request body
    if (!entityInfo.entityIdentifier) {
      for (const field of identifierFields) {
        if (body?.[field]) {
          entityInfo.entityIdentifier = body[field];
          break;
        }
      }
    }

    return entityInfo;
  }

  private extractOldValues(body: any, responseData: any): any {
    if (!body && !responseData) return null;

    // For basic implementation, return fields that are being updated
    // In a more robust implementation, you might want to fetch the original
    // entity from the database before the update
    const oldValues: any = {};

    // Common fields to track for products
    const trackedFields = [
      'name', 'description', 'price', 'cost', 'quantity', 'sku',
      'barcode', 'category_id', 'status', 'code', 'product_name',
      'unit_price', 'selling_price', 'stock_quantity', 'brand_id'
    ];

    for (const field of trackedFields) {
      if (body && body.hasOwnProperty(field)) {
        // Note: In a real implementation, you'd fetch the original value
        // For now, we'll indicate it was changed
        oldValues[field] = '[PREVIOUS_VALUE]';
      }
    }

    // Also check for any nested fields in case of complex objects
    if (body && typeof body === 'object') {
      for (const key in body) {
        if (key.startsWith('_') || key.includes('password') || key.includes('token')) {
          continue; // Skip sensitive fields
        }
        if (trackedFields.includes(key)) continue; // Already tracked above

        // Add any other fields being updated
        if (body[key] !== undefined && body[key] !== null) {
          oldValues[key] = '[PREVIOUS_VALUE]';
        }
      }
    }

    const result = Object.keys(oldValues).length > 0 ? oldValues : null;

    return result;
  }

  private getEntityType(resource: string): string {
    const entityMap: Record<string, string> = {
      sales: 'Sale',
      purchases: 'Purchase',
      'sale-returns': 'SaleReturn',
      'purchase-returns': 'PurchaseReturn',
      customers: 'Customer',
      suppliers: 'Supplier',
      products: 'Product',
      inventory: 'Inventory',
      warehouses: 'Warehouse',
      branches: 'Branch',
      users: 'User',
      accounts: 'Account',
      auth: 'Authentication',
      audit: 'AuditTrail',
      'customer-group': 'CustomerGroup',
      'expense-category': 'ExpenseCategory',
      roles: 'Role',
      permissions: 'Permission',
      pos: 'PointOfSale',
      payments: 'Payment',
      expenses: 'Expense',
      'unknown': 'Unknown',
    };

    const normalizedResource = resource.toLowerCase().trim();

    if (!normalizedResource) {
      return 'Unknown';
    }

    return entityMap[normalizedResource] ||
           resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase() ||
           'Unknown';
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data || null;
    }

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization'];

    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      const result = { ...obj };
      for (const field of sensitiveFields) {
        if (field in result) {
          result[field] = '[REDACTED]';
        }
      }
      return result;
    };

    return sanitizeObject(data);
  }
}
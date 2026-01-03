import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const result: any = {
          statusCode: response.statusCode,
          message: data?.message || this.getDefaultMessage(ctx, data),
          data: data?.data ?? data,
        };

      
        if (data?.meta) {
          result.meta = data.meta;
        }

        return result;
      }),
    );
  }

  /** Generate default success messages */
  private getDefaultMessage(ctx: any, data: any): string {
    const method = ctx.getRequest().method;

    switch (method) {
      case 'GET':
        return Array.isArray(data)
          ? 'Data retrieved successfully'
          : 'Item retrieved successfully';
      case 'POST':
        return 'Created successfully';
      case 'PATCH':
      case 'PUT':
        return 'Updated successfully';
      case 'DELETE':
        return 'Deleted successfully';
      default:
        return 'Success';
    }
  }
}

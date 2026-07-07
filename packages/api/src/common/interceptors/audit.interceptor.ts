import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Skip certain endpoints
    const skipPaths = ['/auth/login', '/auth/register', '/auth/customer', '/auth/logout', '/auth/refresh'];
    if (skipPaths.some(p => url.startsWith(p))) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          
          // Determine entity and action from URL
          const urlParts = url.split('/').filter(Boolean);
          const entity = urlParts[1] || 'unknown'; // e.g., 'products', 'orders', 'settings'
          const entityId = urlParts[2] && urlParts[2].length > 10 ? urlParts[2] : undefined;
          
          let action = method;
          if (method === 'POST' && !entityId) action = 'CREATE';
          else if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
          else if (method === 'DELETE') action = 'DELETE';

          // Log asynchronously (don't block response)
          this.auditService.log({
            userId: user?.id,
            action,
            entity,
            entityId,
            newData: body && Object.keys(body).length > 0 ? body : undefined,
            ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
            userAgent: headers['user-agent'],
          }).catch(() => {}); // Silently fail
        },
        error: () => {
          // Don't log failed requests
        },
      }),
    );
  }
}

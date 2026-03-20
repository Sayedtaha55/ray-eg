import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();

    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const method = String(req?.method || '').toUpperCase();
    const url = String(req?.originalUrl || req?.url || '');
    const requestId = String(req?.requestId || req?.headers?.['x-request-id'] || '').trim();

    const userId = (() => {
      const u = req?.user;
      if (!u) return undefined;
      const id = u?.id ?? u?.userId ?? u?.sub;
      const s = id == null ? '' : String(id).trim();
      return s || undefined;
    })();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        const statusCode = typeof res?.statusCode === 'number' ? res.statusCode : 200;
        this.logger.logRequest(method, url, statusCode, duration, userId, requestId);
        if (requestId) {
          this.logger.debug('Request completed', { requestId, method, url, statusCode, duration, userId });
        }
      }),
      catchError((err) => {
        const duration = Date.now() - startedAt;
        const statusCode = typeof err?.getStatus === 'function' ? err.getStatus() : 500;
        this.logger.logRequest(method, url, statusCode, duration, userId, requestId);
        this.logger.error('Request failed', {
          requestId,
          method,
          url,
          statusCode,
          duration,
          userId,
          error: err?.stack || err,
        });
        throw err;
      }),
    );
  }
}

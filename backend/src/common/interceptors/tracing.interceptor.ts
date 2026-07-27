import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

let traceApi: any = null;
let otelLoaded = false;

async function loadOtel() {
  if (otelLoaded) return traceApi;
  otelLoaded = true;
  try {
    traceApi = await import('@opentelemetry/api');
  } catch {
    traceApi = null;
  }
  return traceApi;
}

loadOtel();

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const enabled = String(process.env.OTEL_ENABLED || 'false').toLowerCase() === 'true';
    if (!enabled || !traceApi) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const method = String(req?.method || 'GET').toUpperCase();
    const url = String(req?.originalUrl || req?.url || '/');
    const route = String(req?.route?.path || req?.path || url);
    const traceId = String(req?.headers?.['x-trace-id'] || uuidv4());

    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);

    const spanName = `${method} ${route}`;
    const tracer = traceApi.trace.getTracer('ray-marketplace');
    const span = tracer.startSpan(spanName, {
      attributes: {
        'http.method': method,
        'http.url': url,
        'http.route': route,
        'trace.id': traceId,
      },
    });

    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        const statusCode = typeof res?.statusCode === 'number' ? res.statusCode : 200;
        span.setAttribute('http.status_code', statusCode);
        span.setAttribute('http.duration_ms', duration);
        span.setStatus({ code: traceApi.SpanStatusCode.OK });
        span.end();
      }),
      catchError((err) => {
        const duration = Date.now() - startedAt;
        const statusCode = typeof err?.getStatus === 'function' ? err.getStatus() : 500;
        span.setAttribute('http.status_code', statusCode);
        span.setAttribute('http.duration_ms', duration);
        span.setAttribute('error', true);
        span.recordException(err);
        span.setStatus({ code: traceApi.SpanStatusCode.ERROR, message: err?.message || 'Internal error' });
        span.end();
        throw err;
      }),
    );
  }
}

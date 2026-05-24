import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorEnvelope = {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  requestId: string | null;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string; requestId?: string }>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const normalized = this.normalizePayload(payload);

    const envelope: ErrorEnvelope = {
      success: false,
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message: status >= 500 && isProd ? 'Internal server error' : normalized.message,
      path: request.originalUrl || request.url || '',
      requestId: request.requestId ?? request.id ?? null,
      timestamp: new Date().toISOString(),
    };

    if (normalized.details.length > 0 && status < 500) {
      envelope.details = normalized.details;
    }

    response.status(status).json(envelope);
  }

  private normalizePayload(payload: unknown): { message: string; details: string[] } {
    if (typeof payload === 'string') return { message: payload, details: [] };

    if (payload && typeof payload === 'object') {
      const candidate = (payload as { message?: unknown }).message;
      if (Array.isArray(candidate)) {
        const details = candidate.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
        return { message: details[0] || 'Validation failed', details };
      }
      if (typeof candidate === 'string') return { message: candidate, details: [] };
    }

    return { message: 'Unexpected server error', details: [] };
  }
}

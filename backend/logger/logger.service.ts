import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import pino, { Logger as PinoLogger } from 'pino';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: PinoLogger;

  onModuleInit() {
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    const level = String(process.env.LOG_LEVEL || 'info').toLowerCase();

    const enableFileLogs = isProd;
    const writeToFile = String(process.env.LOG_TO_FILE || '').trim().toLowerCase() === 'true';

    let destination: any = undefined;

    if (enableFileLogs && writeToFile) {
      try {
        const logDir = process.env.RAILWAY_ENVIRONMENT ? '/tmp/logs' : 'logs';
        fs.mkdirSync(logDir, { recursive: true });
        destination = pino.destination({ dest: `${logDir}/combined.log`, sync: false });
      } catch {
        destination = undefined;
      }
    }

    const transport = !isProd
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined;

    this.logger = pino(
      {
        level,
        base: { service: 'ray-marketplace' },
        ...(transport ? { transport } : {}),
      },
      destination,
    );
  }

  log(message: string, meta?: any) {
    if (meta !== undefined) this.logger.info(meta, message);
    else this.logger.info(message);
  }

  error(message: string, error?: Error | any) {
    const err = error instanceof Error ? error : undefined;
    const payload = err ? { err } : { error: (error as any)?.stack || error };
    this.logger.error(payload as any, message);
  }

  warn(message: string, meta?: any) {
    if (meta !== undefined) this.logger.warn(meta, message);
    else this.logger.warn(message);
  }

  debug(message: string, meta?: any) {
    if (meta !== undefined) this.logger.debug(meta, message);
    else this.logger.debug(message);
  }

  // Performance monitoring
  logPerformance(operation: string, duration: number, meta?: any) {
    this.logger.info(
      {
        operation,
        durationMs: duration,
        ...(meta || {}),
      },
      `Performance: ${operation}`,
    );
  }

  // API request logging
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string) {
    this.logger.info(
      {
        method,
        url,
        statusCode,
        durationMs: duration,
        userId,
        requestId,
      },
      'API Request',
    );
  }

  // Database operation logging
  logDatabase(operation: string, table: string, duration: number, success: boolean) {
    this.logger.info(
      {
        operation,
        table,
        durationMs: duration,
        success,
      },
      'Database Operation',
    );
  }

  // Cache operation logging
  logCache(operation: string, key: string, hit: boolean, duration?: number) {
    this.logger.info(
      {
        operation,
        key,
        hit,
        durationMs: typeof duration === 'number' ? duration : undefined,
      },
      'Cache Operation',
    );
  }

  // Security events
  logSecurity(event: string, userId?: string, ip?: string, details?: any) {
    this.logger.warn(
      {
        event,
        userId,
        ip,
        details,
      },
      'Security Event',
    );
  }

  // Business events
  logBusiness(event: string, data: any) {
    this.logger.info(
      {
        event,
        data,
      },
      'Business Event',
    );
  }
}

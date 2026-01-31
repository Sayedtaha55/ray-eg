import { Injectable, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';
import * as fs from 'fs';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: winston.Logger;

  onModuleInit() {
    const enableFileLogs = process.env.NODE_ENV === 'production';

    const transports: any[] = [];

    if (enableFileLogs) {
      try {
        // Use /tmp for logs in Railway to avoid permission issues
        const logDir = process.env.RAILWAY_ENVIRONMENT ? '/tmp/logs' : 'logs';
        fs.mkdirSync(logDir, { recursive: true });
      } catch {
        // ignore
      }

      const logDir = process.env.RAILWAY_ENVIRONMENT ? '/tmp/logs' : 'logs';

      transports.push(
        // Error log file
        new winston.transports.File({
          filename: `${logDir}/error.log`,
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      );

      transports.push(
        // Combined log file
        new winston.transports.File({
          filename: `${logDir}/combined.log`,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      );
    }

    // Add console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      defaultMeta: { service: 'ray-marketplace' },
      transports,
    });
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | any) {
    this.logger.error(message, { error: error?.stack || error });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  // Performance monitoring
  logPerformance(operation: string, duration: number, meta?: any) {
    this.logger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  }

  // API request logging
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.logger.info('API Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  // Database operation logging
  logDatabase(operation: string, table: string, duration: number, success: boolean) {
    this.logger.info('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString()
    });
  }

  // Cache operation logging
  logCache(operation: string, key: string, hit: boolean, duration?: number) {
    this.logger.info('Cache Operation', {
      operation,
      key,
      hit,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Security events
  logSecurity(event: string, userId?: string, ip?: string, details?: any) {
    this.logger.warn('Security Event', {
      event,
      userId,
      ip,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Business events
  logBusiness(event: string, data: any) {
    this.logger.info('Business Event', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: winston.Logger;

  onModuleInit() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      defaultMeta: { service: 'ray-marketplace' },
      transports: [
        // Error log file
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Combined log file
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Add console transport for development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
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

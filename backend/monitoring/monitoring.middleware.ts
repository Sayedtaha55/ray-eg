import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware, OnModuleInit {
  constructor(private readonly monitoring: MonitoringService) {}

  onModuleInit() {
    // Add custom health checks - with safety check
    if (this.monitoring && typeof this.monitoring.addHealthCheck === 'function') {
      this.monitoring.addHealthCheck('api', async () => {
        // Basic API health check
        return true;
      });
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response
    res.send = function (body: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Track API call - with safety check
      if (this.monitoring && typeof this.monitoring.trackApiCall === 'function') {
        this.monitoring.trackApiCall(
          req.method,
          req.originalUrl,
          statusCode,
          duration
        );
      }

      return originalSend.call(res, body);
    }.bind({ monitoring: this.monitoring });

    next();
  }
}

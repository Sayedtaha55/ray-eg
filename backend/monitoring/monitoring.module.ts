import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringMiddleware } from './monitoring.middleware';
import { LoggerService } from '../logger/logger.service';

@Module({
  providers: [
    MonitoringService,
    LoggerService,
  ],
  exports: [
    MonitoringService,
    LoggerService,
  ],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MonitoringMiddleware)
      .forRoutes('*');
  }
}

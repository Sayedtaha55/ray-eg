import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiBuilderController } from './ai-builder.controller';
import { AiBuilderService } from './ai-builder.service';
import { AiAuditService } from './ai-audit.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiJobsService } from './ai-jobs.service';
import { AiGuardrailsService } from './ai-guardrails.service';
import { AiCacheService } from './ai-cache.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';

@Module({
  imports: [ConfigModule, PrismaModule, RedisModule],
  controllers: [AiController, AiBuilderController],
  providers: [AiService, AiBuilderService, AiAuditService, KnowledgeBaseService, AiJobsService, AiGuardrailsService, AiCacheService],
  exports: [AiService, AiBuilderService, AiAuditService, KnowledgeBaseService, AiJobsService, AiGuardrailsService, AiCacheService],
})
export class AiModule {}

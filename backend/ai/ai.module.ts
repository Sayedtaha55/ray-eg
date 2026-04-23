import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiAuditService } from './ai-audit.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiJobsService } from './ai-jobs.service';
import { AiGuardrailsService } from './ai-guardrails.service';
import { AiCacheService } from './ai-cache.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiAuditService, KnowledgeBaseService, AiJobsService, AiGuardrailsService, AiCacheService],
  exports: [AiService, AiAuditService, KnowledgeBaseService, AiJobsService, AiGuardrailsService, AiCacheService],
})
export class AiModule {}

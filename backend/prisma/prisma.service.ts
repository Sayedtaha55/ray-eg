import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

 declare global {
   // eslint-disable-next-line no-var
   var __prismaService: PrismaService | undefined;
 }

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const existing = globalThis.__prismaService;
    if (existing) {
      return existing;
    }

    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__prismaService = this;
    }
  }

  async onModuleInit() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const databaseUrl = String(process.env.DATABASE_URL || '').trim();
    const allowProdDbInDev = String(process.env.ALLOW_PROD_DATABASE_IN_DEV || '').toLowerCase() === 'true';

    if (env !== 'production' && !allowProdDbInDev) {
      const lowered = databaseUrl.toLowerCase();
      const looksLikeRailway = lowered.includes('railway') || lowered.includes('rlwy') || lowered.includes('proxy.rlwy.net');
      const looksLikeProductionDomain = lowered.includes('.railway.app');
      if (databaseUrl && (looksLikeRailway || looksLikeProductionDomain)) {
        throw new Error(
          'Unsafe DATABASE_URL for development. Refusing to connect to a production/hosted database while NODE_ENV is not production. ' +
            'Use a local/dev database, or set ALLOW_PROD_DATABASE_IN_DEV=true if you intentionally want this.',
        );
      }
    }

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

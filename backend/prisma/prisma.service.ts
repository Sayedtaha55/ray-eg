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
      if (process.env.NODE_ENV !== 'production') {
        console.log('[PrismaService] constructor: reusing existing instance');
      }
      return existing;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[PrismaService] constructor: creating PrismaClient...');
    }
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[PrismaService] constructor: PrismaClient created');
    }

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__prismaService = this;
    }
  }

  async onModuleInit() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const databaseUrl = String(process.env.DATABASE_URL || '').trim();
    const allowProdDbInDev = String(process.env.ALLOW_PROD_DATABASE_IN_DEV || '').toLowerCase() === 'true';

    if (env !== 'production') {
      try {
        if (databaseUrl) {
          const u = new URL(databaseUrl);
          const dbName = String(u.pathname || '').replace(/^\//, '');
          // eslint-disable-next-line no-console
          console.log('[PrismaService] DATABASE_URL (safe):', {
            protocol: u.protocol.replace(':', ''),
            host: u.host,
            database: dbName,
          });
        } else {
          // eslint-disable-next-line no-console
          console.log('[PrismaService] DATABASE_URL (safe):', { empty: true });
        }
      } catch {
        // eslint-disable-next-line no-console
        console.log('[PrismaService] DATABASE_URL (safe):', { parseError: true });
      }
    }

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

    try {
      if (env !== 'production') {
        console.log('[PrismaService] Attempting to connect to the database...');
      }
      if (env !== 'production') {
        const timeoutMs = 15_000;
        await Promise.race([
          this.$connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Prisma connect timeout after ${timeoutMs}ms`)), timeoutMs)),
        ]);
      } else {
        await this.$connect();
      }
      if (env !== 'production') {
        console.log('[PrismaService] Database connection successful.');
      }
    } catch (error) {
      console.error('[PrismaService] !!! DATABASE CONNECTION FAILED !!!', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

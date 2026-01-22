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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

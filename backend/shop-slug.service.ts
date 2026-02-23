import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ShopSlugService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string) {
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async generateUniqueSlug(name: string) {
    const base = this.slugify(name);
    let slug = base || 'shop';

    let counter = 1;
    let uniqueSlug = slug;
    while (await this.prisma.shop.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private client: Client;
  private isElasticsearchAvailable = false;

  constructor() {
    const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    this.client = new Client({
      node: esUrl,
    });

    this.initializeIndices();
  }

  private async initializeIndices() {
    try {
      // Check if Elasticsearch is available
      await this.client.ping();
      this.isElasticsearchAvailable = true;

      // Create products index if not exists
      const productsExists = await this.client.indices.exists({
        index: 'products',
      });

      if (!productsExists) {
        await this.client.indices.create({
          index: 'products',
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: {
                  type: 'text',
                  fields: {
                    arabic: { type: 'text', analyzer: 'arabic' },
                    english: { type: 'text', analyzer: 'english' },
                  },
                },
                description: {
                  type: 'text',
                  fields: {
                    arabic: { type: 'text', analyzer: 'arabic' },
                    english: { type: 'text', analyzer: 'english' },
                  },
                },
                price: { type: 'double' },
                shopId: { type: 'keyword' },
                shopName: { type: 'text' },
                category: { type: 'keyword' },
                stock: { type: 'integer' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
            settings: {
              analysis: {
                analyzer: {
                  arabic: {
                    tokenizer: 'standard',
                    filter: ['lowercase', 'arabic_normalization'],
                  },
                },
              },
            },
          },
        } as any);
        this.logger.log('Products index created');
      }

      // Create shops index if not exists
      const shopsExists = await this.client.indices.exists({
        index: 'shops',
      });

      if (!shopsExists) {
        await this.client.indices.create({
          index: 'shops',
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: {
                  type: 'text',
                  fields: {
                    arabic: { type: 'text', analyzer: 'arabic' },
                    english: { type: 'text', analyzer: 'english' },
                  },
                },
                description: {
                  type: 'text',
                  fields: {
                    arabic: { type: 'text', analyzer: 'arabic' },
                    english: { type: 'text', analyzer: 'english' },
                  },
                },
                slug: { type: 'keyword' },
                category: { type: 'keyword' },
                governorate: { type: 'keyword' },
                city: { type: 'keyword' },
                address: { type: 'text' },
                isActive: { type: 'boolean' },
                isPublic: { type: 'boolean' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log('Shops index created');
      }

      this.logger.log('Elasticsearch indices initialized successfully');
    } catch (error) {
      this.isElasticsearchAvailable = false;
      this.logger.warn(
        `Elasticsearch unavailable during startup (${this.getErrorMessage(error)}). Search indexing is disabled until the service becomes reachable.`,
      );
      // Don't throw - allow app to start without Elasticsearch
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }

  private ensureElasticsearchAvailable(operation: string): boolean {
    if (this.isElasticsearchAvailable) {
      return true;
    }

    this.logger.warn(`Skipping ${operation}: Elasticsearch is unavailable`);
    return false;
  }

  async indexProduct(product: any) {
    if (!this.ensureElasticsearchAvailable(`indexProduct(${product?.id ?? 'unknown'})`)) {
      return;
    }

    try {
      await this.client.index({
        index: 'products',
        id: product.id,
        body: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          shopId: product.shopId,
          shopName: product.shopName,
          category: product.category,
          stock: product.stock,
          isActive: product.isActive ?? true,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      } as any);
      this.logger.log(`Product ${product.id} indexed`);
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}: ${this.getErrorMessage(error)}`);
    }
  }

  async indexShop(shop: any) {
    if (!this.ensureElasticsearchAvailable(`indexShop(${shop?.id ?? 'unknown'})`)) {
      return;
    }

    try {
      await this.client.index({
        index: 'shops',
        id: shop.id,
        body: {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          slug: shop.slug,
          category: shop.category,
          governorate: shop.governorate,
          city: shop.city,
          address: shop.address,
          isActive: shop.isActive,
          isPublic: shop.isPublic,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
      } as any);
      this.logger.log(`Shop ${shop.id} indexed`);
    } catch (error) {
      this.logger.error(`Failed to index shop ${shop.id}: ${this.getErrorMessage(error)}`);
    }
  }

  async searchProducts(query: string, filters?: {
    shopId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    if (!this.ensureElasticsearchAvailable('searchProducts')) {
      return [];
    }

    try {
      const must: any[] = [
        {
          multi_match: {
            query,
            fields: ['name', 'name.arabic', 'description', 'description.arabic'],
            fuzziness: 'AUTO',
          },
        },
      ];

      if (filters?.shopId) {
        must.push({ term: { shopId: filters.shopId } });
      }

      if (filters?.category) {
        must.push({ term: { category: filters.category } });
      }

      if (filters?.minPrice || filters?.maxPrice) {
        must.push({
          range: {
            price: {
              ...(filters.minPrice && { gte: filters.minPrice }),
              ...(filters.maxPrice && { lte: filters.maxPrice }),
            },
          },
        } as any);
      }

      const result = await this.client.search({
        index: 'products',
        body: {
          query: {
            bool: {
              must,
              filter: [{ term: { isActive: true } }],
            },
          },
          size: 20,
        },
      } as any);

      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
      }));
    } catch (error) {
      this.logger.error(`Search failed (products): ${this.getErrorMessage(error)}`);
      return [];
    }
  }

  async searchShops(query: string, filters?: {
    category?: string;
    governorate?: string;
    city?: string;
  }) {
    if (!this.ensureElasticsearchAvailable('searchShops')) {
      return [];
    }

    try {
      const must: any[] = [
        {
          multi_match: {
            query,
            fields: ['name', 'name.arabic', 'description', 'description.arabic'],
            fuzziness: 'AUTO',
          },
        },
      ];

      if (filters?.category) {
        must.push({ term: { category: filters.category } });
      }

      if (filters?.governorate) {
        must.push({ term: { governorate: filters.governorate } });
      }

      if (filters?.city) {
        must.push({ term: { city: filters.city } });
      }

      const result = await this.client.search({
        index: 'shops',
        body: {
          query: {
            bool: {
              must,
              filter: [
                { term: { isActive: true } },
                { term: { isPublic: true } },
              ],
            },
          },
          size: 20,
        },
      } as any);

      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
      }));
    } catch (error) {
      this.logger.error(`Search failed (shops): ${this.getErrorMessage(error)}`);
      return [];
    }
  }

  async deleteProduct(productId: string) {
    if (!this.ensureElasticsearchAvailable(`deleteProduct(${productId})`)) {
      return;
    }

    try {
      await this.client.delete({
        index: 'products',
        id: productId,
      } as any);
      this.logger.log(`Product ${productId} deleted from index`);
    } catch (error) {
      this.logger.error(`Failed to delete product ${productId}: ${this.getErrorMessage(error)}`);
    }
  }

  async deleteShop(shopId: string) {
    if (!this.ensureElasticsearchAvailable(`deleteShop(${shopId})`)) {
      return;
    }

    try {
      await this.client.delete({
        index: 'shops',
        id: shopId,
      } as any);
      this.logger.log(`Shop ${shopId} deleted from index`);
    } catch (error) {
      this.logger.error(`Failed to delete shop ${shopId}: ${this.getErrorMessage(error)}`);
    }
  }

  async bulkIndexProducts(products: any[]) {
    if (!this.ensureElasticsearchAvailable(`bulkIndexProducts(${products.length})`)) {
      return;
    }

    try {
      const body = products.flatMap((product) => [
        { index: { _index: 'products', _id: product.id } },
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          shopId: product.shopId,
          shopName: product.shopName,
          category: product.category,
          stock: product.stock,
          isActive: product.isActive ?? true,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ]);

      await this.client.bulk({ body } as any);
      this.logger.log(`Bulk indexed ${products.length} products`);
    } catch (error) {
      this.logger.error(`Bulk index failed (products): ${this.getErrorMessage(error)}`);
    }
  }

  async bulkIndexShops(shops: any[]) {
    if (!this.ensureElasticsearchAvailable(`bulkIndexShops(${shops.length})`)) {
      return;
    }

    try {
      const body = shops.flatMap((shop) => [
        { index: { _index: 'shops', _id: shop.id } },
        {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          slug: shop.slug,
          category: shop.category,
          governorate: shop.governorate,
          city: shop.city,
          address: shop.address,
          isActive: shop.isActive,
          isPublic: shop.isPublic,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
      ]);

      await this.client.bulk({ body } as any);
      this.logger.log(`Bulk indexed ${shops.length} shops`);
    } catch (error) {
      this.logger.error(`Bulk index failed (shops): ${this.getErrorMessage(error)}`);
    }
  }
}

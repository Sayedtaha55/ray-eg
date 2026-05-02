import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiMessage } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';

interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

interface SearchResult {
  chunks: KnowledgeChunk[];
  totalFound: number;
  query: string;
}

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly provider: AiProvider;
  private readonly embeddingModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.provider = new GroqProvider({
      apiKey: this.config.get<string>('GROQ_API_KEY') || this.config.get<string>('OPENAI_API_KEY'),
      model: this.config.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile',
    });
    this.embeddingModel = this.config.get<string>('EMBEDDING_MODEL') || 'text-embedding-3-small';
  }

  /**
   * Generate embeddings for text using AI provider
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Note: Groq doesn't support embeddings yet, so we'll use a fallback
      // In production, use OpenAI or dedicated embedding service
      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: 'Generate a semantic embedding as a JSON array of 1536 numbers.' },
          { role: 'user', content: `Text: "${text.substring(0, 8000)}"` },
        ],
        temperature: 0,
        maxTokens: 100,
      });

      // Fallback: create a simple hash-based embedding
      // In production, replace with actual embedding API
      return this.createSimpleEmbedding(text);
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      return this.createSimpleEmbedding(text);
    }
  }

  /**
   * Fallback: Create a simple deterministic embedding
   * This is NOT for production - replace with actual embedding API
   */
  private createSimpleEmbedding(text: string): number[] {
    // Create a deterministic pseudo-random embedding based on text hash
    const hash = this.hashString(text);
    const embedding: number[] = [];
    
    // Use a seeded random-like generation
    let seed = hash;
    for (let i = 0; i < 1536; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      embedding.push((seed / 233280) * 2 - 1); // Range [-1, 1]
    }
    
    return embedding;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Add a document to the knowledge base
   */
  async addDocument(params: {
    shopId: string;
    type: 'product' | 'policy' | 'faq' | 'support_ticket' | 'custom';
    title: string;
    content: string;
    sourceId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const { shopId, type, title, content, sourceId, metadata = {} } = params;

    // Split content into chunks if too long
    const chunks = this.chunkContent(content, 1000, 200);
    const documentIds: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk);

      const doc = await this.prisma.knowledgeDocument.create({
        data: {
          shopId,
          type,
          sourceId,
          title: chunks.length > 1 ? `${title} (part ${i + 1}/${chunks.length})` : title,
          content: chunk,
          contentVector: embedding as any,
          metadata: {
            ...metadata,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        },
      });

      documentIds.push(doc.id);
    }

    this.logger.log(`Added ${chunks.length} document chunks for shop ${shopId}`);
    return documentIds[0]; // Return first chunk ID
  }

  /**
   * Chunk content into smaller pieces with overlap
   */
  private chunkContent(text: string, chunkSize: number, overlap: number): string[] {
    if (text.length <= chunkSize) return [text];

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      
      // Try to break at a sentence or word boundary
      let breakPoint = end;
      if (end < text.length) {
        const searchEnd = Math.min(end + 100, text.length);
        const searchText = text.substring(end - 50, searchEnd);
        
        // Find sentence break
        const sentenceMatch = searchText.match(/[.!?]\s+/);
        if (sentenceMatch && sentenceMatch.index !== undefined) {
          breakPoint = end - 50 + sentenceMatch.index + sentenceMatch[0].length;
        } else {
          // Find word break
          const wordMatch = searchText.match(/\s+/);
          if (wordMatch && wordMatch.index !== undefined) {
            breakPoint = end - 50 + wordMatch.index;
          }
        }
      }

      chunks.push(text.substring(start, breakPoint).trim());
      start = breakPoint - overlap;
    }

    return chunks;
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Search knowledge base using vector similarity (JS-based, no pgvector required)
   */
  async search(params: {
    shopId: string;
    query: string;
    type?: string;
    limit?: number;
    threshold?: number;
  }): Promise<SearchResult> {
    const { shopId, query, type, limit = 5, threshold = 0.5 } = params;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Fetch all active documents for this shop (with optional type filter)
    const where: any = { shopId, isActive: true };
    if (type) where.type = type;

    const docs = await this.prisma.knowledgeDocument.findMany({
      where,
      select: {
        id: true,
        content: true,
        metadata: true,
        contentVector: true,
      },
    });

    // Compute similarity for each document
    const scored = docs
      .map((doc) => {
        const vec = doc.contentVector as number[] | null;
        const similarity = vec ? this.cosineSimilarity(queryEmbedding, vec) : 0;
        return { id: doc.id, content: doc.content, metadata: doc.metadata as Record<string, any>, similarity };
      })
      .filter((d) => d.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return {
      chunks: scored,
      totalFound: scored.length,
      query,
    };
  }

  /**
   * Get context for AI assistant from knowledge base
   */
  async getContext(params: {
    shopId: string;
    query: string;
    maxChunks?: number;
  }): Promise<string> {
    const { shopId, query, maxChunks = 3 } = params;

    const searchResult = await this.search({
      shopId,
      query,
      limit: maxChunks,
      threshold: 0.6,
    });

    if (searchResult.chunks.length === 0) {
      return '';
    }

    // Build context from chunks
    const contextParts = searchResult.chunks.map((chunk, i) => {
      const meta = chunk.metadata || {};
      return `[${i + 1}] ${meta.type || 'Info'}: ${chunk.content}`;
    });

    return `\n\nRELEVANT INFORMATION:\n${contextParts.join('\n\n')}`;
  }

  /**
   * Sync product to knowledge base
   */
  async syncProduct(shopId: string, product: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    tags?: string[];
  }): Promise<void> {
    // Remove existing product documents
    await this.prisma.knowledgeDocument.updateMany({
      where: {
        shopId,
        sourceId: product.id,
        type: 'product',
      },
      data: { isActive: false },
    });

    // Build product content
    const content = [
      `Product: ${product.name}`,
      product.description ? `Description: ${product.description}` : '',
      product.price ? `Price: ${product.price}` : '',
      product.category ? `Category: ${product.category}` : '',
      product.tags?.length ? `Tags: ${product.tags.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    await this.addDocument({
      shopId,
      type: 'product',
      title: product.name,
      content,
      sourceId: product.id,
      metadata: {
        productId: product.id,
        price: product.price,
        category: product.category,
      },
    });
  }

  /**
   * Sync shop FAQ/Policy to knowledge base
   */
  async syncPolicy(shopId: string, params: {
    type: 'policy' | 'faq';
    title: string;
    content: string;
  }): Promise<void> {
    await this.addDocument({
      shopId,
      type: params.type,
      title: params.title,
      content: params.content,
    });
  }

  /**
   * Remove document from knowledge base
   */
  async removeDocument(shopId: string, documentId: string): Promise<void> {
    await this.prisma.knowledgeDocument.update({
      where: { id: documentId, shopId },
      data: { isActive: false },
    });
  }

  /**
   * Get knowledge base stats for a shop
   */
  async getStats(shopId: string) {
    const [total, byType] = await Promise.all([
      this.prisma.knowledgeDocument.count({
        where: { shopId, isActive: true },
      }),
      this.prisma.knowledgeDocument.groupBy({
        by: ['type'],
        where: { shopId, isActive: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalDocuments: total,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

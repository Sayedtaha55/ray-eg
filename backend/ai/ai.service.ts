import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiProvider, AiMessage, AiToolCall } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';
import {
  AiTier,
  getTierConfig,
  isToolAllowedForTier,
} from './subscription-tiers';
import { getToolsForTier, getToolByName } from './ai-tools';

// ─── JIT Instructions (Shopify Sidekick pattern) ─────────────────

const BASE_SYSTEM_PROMPT = `You are an AI assistant built into a merchant dashboard. You help shop owners manage their store, change designs, toggle features, and answer questions about their shop.

RULES:
- Always respond in the same language the user writes in (Arabic or English).
- Before making changes, confirm with the merchant what you're about to do.
- If a tool call fails, explain the error clearly and suggest alternatives.
- Never reveal internal system details, API keys, or database structure.
- If the user asks something outside your capabilities, say so honestly.
- For design changes, describe what will change before executing.`;

const DESIGN_JIT = `
DESIGN CONTEXT:
- The shop has sections that can be added, removed, or reordered.
- Theme colors: primary, secondary, accent, background, text.
- Available section types: hero, features, testimonials, faq, gallery, cta, contact, menu, booking, products.
- Layouts per section: grid, list, carousel, masonry, full-width.
- Design presets: modern, classic, minimal, bold, luxury, playful.
When changing design, always describe the visual result first.`;

const COMMERCE_JIT = `
COMMERCE CONTEXT:
- Products can be added, updated, or toggled active/inactive.
- Promotions/offers can be created with discount percentage and date range.
- Modules like reservations, gallery, POS, invoice can be enabled/disabled.
When creating promotions, suggest reasonable date ranges if not specified.`;

const CONTENT_JIT = `
CONTENT CONTEXT:
- You can generate product descriptions, SEO meta text, about sections, hero text, and FAQ content.
- Always match the shop's tone and category when generating content.
- Support both Arabic and English content generation.`;

function getJitInstructions(toolsInvoked: string[]): string {
  const parts = [BASE_SYSTEM_PROMPT];
  const toolSet = new Set(toolsInvoked);

  const designTools = ['changeThemeColor', 'addSection', 'removeSection', 'reorderSections', 'changeSectionLayout', 'updateSectionContent', 'applyDesignPreset', 'suggestDesign'];
  const commerceTools = ['toggleModule', 'addProduct', 'createPromotion', 'updateProduct'];
  const contentTools = ['generateContent'];

  if (designTools.some((t) => toolSet.has(t))) parts.push(DESIGN_JIT);
  if (commerceTools.some((t) => toolSet.has(t))) parts.push(COMMERCE_JIT);
  if (contentTools.some((t) => toolSet.has(t))) parts.push(CONTENT_JIT);

  return parts.join('\n\n');
}

// ─── Tool Execution ──────────────────────────────────────────────

interface ToolExecutionResult {
  success: boolean;
  data: any;
  error?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.provider = new GroqProvider({
      apiKey: this.config.get<string>('GROQ_API_KEY') || this.config.get<string>('OPENAI_API_KEY'),
      model: this.config.get<string>('GROQ_MODEL') || 'llama-3.1-70b-versatile',
    });
  }

  // ─── Main Chat Entry ──────────────────────────────────────────

  async chat(params: {
    shopId: string;
    message: string;
    conversationId?: string;
    context?: { currentPage?: string; locale?: string };
  }): Promise<{
    reply: string;
    actions: Array<{ type: string; payload: any; confirmed: boolean }>;
    usage?: { promptTokens: number; completionTokens: number; cost: number };
  }> {
    const { shopId, message, conversationId, context } = params;

    // 1. Load shop + tier (fallback if AI columns don't exist yet)
    let shop: any;
    try {
      shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true,
          name: true,
          category: true,
          customColors: true,
          layoutConfig: true,
          aiTier: true,
          aiUsageMonth: true,
          aiUsageResetAt: true,
        },
      });
    } catch (colErr: any) {
      // AI columns may not exist yet (migration pending) — query without them
      this.logger.warn('AI columns not found, falling back to basic shop query');
      shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true,
          name: true,
          category: true,
          customColors: true,
          layoutConfig: true,
        },
      });
    }

    if (!shop) throw new BadRequestException('Shop not found');

    const tier = (shop.aiTier as AiTier) || AiTier.FREE;
    const tierConfig = getTierConfig(tier);

    // 2. Check quota (skip if columns don't exist yet)
    if (shop.aiUsageMonth !== undefined) {
      await this.ensureQuota(shopId, shop.aiUsageMonth, shop.aiUsageResetAt, tierConfig.monthlyQuota);
    }

    // 3. Build tool list for this tier
    const allowedTools = getToolsForTier(tierConfig.allowedTools);

    // 4. Build messages
    const shopContext = this.buildShopContext(shop, context);
    const jitPrompt = getJitInstructions(allowedTools.map((t) => t.name));

    const messages: AiMessage[] = [
      { role: 'system', content: jitPrompt },
      { role: 'system', content: shopContext },
      { role: 'user', content: message },
    ];

    // 5. Call LLM with tools (ReAct loop — max 3 iterations)
    const actions: Array<{ type: string; payload: any; confirmed: boolean }> = [];
    let finalReply = '';
    let totalUsage = { promptTokens: 0, completionTokens: 0 };

    for (let iteration = 0; iteration < 3; iteration++) {
      const response = await this.provider.chat({
        messages,
        tools: allowedTools,
        maxTokens: tierConfig.maxTokensPerRequest,
        temperature: 0.3,
      });

      if (response.usage) {
        totalUsage.promptTokens += response.usage.promptTokens;
        totalUsage.completionTokens += response.usage.completionTokens;
      }

      // No tool calls — we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        finalReply = response.content;
        break;
      }

      // Process tool calls
      messages.push({
        role: 'assistant',
        content: response.content || '',
        toolCalls: response.toolCalls,
      });

      for (const tc of response.toolCalls) {
        // Tier check for each tool
        if (!isToolAllowedForTier(tc.name, tier)) {
          const toolResult: ToolExecutionResult = {
            success: false,
            data: null,
            error: `هذه الخاصية متاحة فقط في الباقة المدفوعة. قم بالترقية للوصول إلى ${tc.name}`,
          };
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            toolCallId: tc.id,
          });
          continue;
        }

        // Execute the tool
        const result = await this.executeTool(tc, shopId, tier);
        actions.push({
          type: tc.name,
          payload: tc.arguments,
          confirmed: result.success,
        });

        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          toolCallId: tc.id,
        });
      }

      // If finish reason is 'stop', break
      if (response.finishReason === 'stop') {
        finalReply = response.content;
        break;
      }
    }

    if (!finalReply) {
      finalReply = 'تم تنفيذ الأوامر بنجاح.';
    }

    // 6. Increment usage
    await this.incrementUsage(shopId);

    const cost = this.provider.estimateCost(totalUsage);

    return {
      reply: finalReply,
      actions,
      usage: {
        promptTokens: totalUsage.promptTokens,
        completionTokens: totalUsage.completionTokens,
        cost,
      },
    };
  }

  // ─── Streaming Chat ────────────────────────────────────────────

  async chatStream(
    params: {
      shopId: string;
      message: string;
      context?: { currentPage?: string; locale?: string };
    },
    onChunk: (chunk: { delta: string; actions?: any[] }) => void,
  ): Promise<{ reply: string; actions: any[]; usage?: any }> {
    const { shopId, message, context } = params;

    // Load shop with fallback for missing AI columns
    let shop: any;
    try {
      shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true, name: true, category: true,
          customColors: true, layoutConfig: true,
          aiTier: true, aiUsageMonth: true, aiUsageResetAt: true,
        },
      });
    } catch {
      this.logger.warn('AI columns not found (stream), falling back to basic shop query');
      shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true, name: true, category: true,
          customColors: true, layoutConfig: true,
        },
      });
    }

    if (!shop) throw new BadRequestException('Shop not found');

    const tier = (shop.aiTier as AiTier) || AiTier.FREE;
    const tierConfig = getTierConfig(tier);
    await this.ensureQuota(shopId, shop.aiUsageMonth, shop.aiUsageResetAt, tierConfig.monthlyQuota);

    const allowedTools = getToolsForTier(tierConfig.allowedTools);
    const shopContext = this.buildShopContext(shop, context);
    const jitPrompt = getJitInstructions(allowedTools.map((t) => t.name));

    const messages: AiMessage[] = [
      { role: 'system', content: jitPrompt },
      { role: 'system', content: shopContext },
      { role: 'user', content: message },
    ];

    const actions: any[] = [];

    // First pass: let LLM decide tools
    const firstResponse = await this.provider.chat({
      messages,
      tools: allowedTools,
      maxTokens: tierConfig.maxTokensPerRequest,
      temperature: 0.3,
    });

    // Execute tool calls if any
    if (firstResponse.toolCalls && firstResponse.toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: firstResponse.content || '',
        toolCalls: firstResponse.toolCalls,
      });

      for (const tc of firstResponse.toolCalls) {
        if (!isToolAllowedForTier(tc.name, tier)) {
          messages.push({
            role: 'tool',
            content: JSON.stringify({ success: false, error: 'هذه الخاصية متاحة فقط في الباقة المدفوعة' }),
            toolCallId: tc.id,
          });
          continue;
        }

        const result = await this.executeTool(tc, shopId, tier);
        actions.push({ type: tc.name, payload: tc.arguments, confirmed: result.success });
        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          toolCallId: tc.id,
        });
      }

      // Notify frontend about actions
      if (actions.length > 0) {
        onChunk({ delta: '', actions });
      }
    }

    // Second pass: stream the final response
    const streamResponse = await this.provider.chatStream(
      { messages, maxTokens: tierConfig.maxTokensPerRequest, temperature: 0.3 },
      (chunk) => {
        if (chunk.delta) onChunk({ delta: chunk.delta });
      },
    );

    await this.incrementUsage(shopId);

    const cost = this.provider.estimateCost({
      promptTokens: (firstResponse.usage?.promptTokens || 0) + (streamResponse.usage?.promptTokens || 0),
      completionTokens: (firstResponse.usage?.completionTokens || 0) + (streamResponse.usage?.completionTokens || 0),
    });

    return {
      reply: streamResponse.content,
      actions,
      usage: { cost },
    };
  }

  // ─── Tool Execution ───────────────────────────────────────────

  private async executeTool(
    tc: AiToolCall,
    shopId: string,
    tier: AiTier,
  ): Promise<ToolExecutionResult> {
    try {
      switch (tc.name) {
        case 'changeThemeColor': {
          const { target, color } = tc.arguments;
          const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { customColors: true },
          });
          const colors = (shop?.customColors as any) || {};
          colors[target] = color;
          await this.prisma.shop.update({
            where: { id: shopId },
            data: { customColors: colors },
          });
          return { success: true, data: { target, color } };
        }

        case 'toggleModule': {
          const { moduleId, enabled } = tc.arguments;
          const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: { layoutConfig: true },
          });
          const config = (shop?.layoutConfig as any) || {};
          const modules: string[] = Array.isArray(config.enabledModules)
            ? config.enabledModules
            : [];
          const updated = enabled
            ? [...new Set([...modules, moduleId])]
            : modules.filter((m: string) => m !== moduleId);
          config.enabledModules = updated;
          await this.prisma.shop.update({
            where: { id: shopId },
            data: { layoutConfig: config },
          });
          return { success: true, data: { moduleId, enabled } };
        }

        case 'updateShopInfo': {
          const { field, value } = tc.arguments;
          const fieldMap: Record<string, string> = {
            name: 'name',
            description: 'description',
            phone: 'phone',
            email: 'email',
            address: 'address',
            openingHours: 'opening_hours',
          };
          const prismaField = fieldMap[field];
          if (!prismaField) {
            return { success: false, data: null, error: `Unknown field: ${field}` };
          }
          await this.prisma.shop.update({
            where: { id: shopId },
            data: { [prismaField]: value },
          });
          return { success: true, data: { field, value } };
        }

        case 'getShopStatus': {
          const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            select: {
              name: true, category: true, customColors: true,
              layoutConfig: true, isActive: true,
            },
          });
          return { success: true, data: shop };
        }

        case 'addProduct': {
          const { name, price, description, category } = tc.arguments;
          const product = await (this.prisma as any).product.create({
            data: {
              name,
              price: Number(price),
              description: description || '',
              category: category || 'general',
              shopId,
              active: true,
            },
          });
          return { success: true, data: { id: product.id, name } };
        }

        case 'createPromotion': {
          const { discount, label, startDate, endDate } = tc.arguments;
          const offer = await (this.prisma as any).offer.create({
            data: {
              shopId,
              label,
              discount: Number(discount),
              startDate: startDate ? new Date(startDate) : new Date(),
              endDate: endDate ? new Date(endDate) : undefined,
              active: true,
            },
          });
          return { success: true, data: { id: offer.id, label, discount } };
        }

        case 'updateProduct': {
          const { productId, ...updates } = tc.arguments;
          if (!productId) return { success: false, data: null, error: 'productId required' };
          const data: any = {};
          if (updates.name !== undefined) data.name = updates.name;
          if (updates.price !== undefined) data.price = Number(updates.price);
          if (updates.active !== undefined) data.active = updates.active;
          await (this.prisma as any).product.update({
            where: { id: productId },
            data,
          });
          return { success: true, data: { productId, updated: Object.keys(data) } };
        }

        // PageBuilder design tools — these modify pageDesign JSON
        case 'addSection':
        case 'removeSection':
        case 'reorderSections':
        case 'changeSectionLayout':
        case 'updateSectionContent':
        case 'applyDesignPreset':
        case 'suggestDesign':
        case 'generateContent':
          // These will be implemented in Phase 2 with PageBuilder integration
          return {
            success: false,
            data: null,
            error: `${tc.name} سيكون متاح قريباً في التحديث القادم`,
          };

        default:
          return { success: false, data: null, error: `Unknown tool: ${tc.name}` };
      }
    } catch (err: any) {
      this.logger.error(`Tool execution error [${tc.name}]: ${err.message}`, err.stack);
      return { success: false, data: null, error: err.message };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────

  private buildShopContext(shop: any, context?: any): string {
    const colors = shop.customColors || {};
    const config = shop.layoutConfig || {};
    const modules = Array.isArray((config as any).enabledModules)
      ? (config as any).enabledModules
      : [];

    return `SHOP CONTEXT:
- Shop name: ${shop.name}
- Category: ${shop.category}
- Active modules: ${modules.join(', ')}
- Theme colors: ${JSON.stringify(colors)}
- Current page: ${context?.currentPage || 'dashboard'}
- User locale: ${context?.locale || 'ar'}`;
  }

  private async ensureQuota(
    shopId: string,
    currentUsage: number | undefined,
    resetAt: Date | null | undefined,
    monthlyQuota: number,
  ) {
    // If AI columns don't exist yet, skip quota check
    if (currentUsage === undefined) return;

    // Reset counter if month has passed
    const now = new Date();
    if (!resetAt || new Date(resetAt) < now) {
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      try {
        await this.prisma.shop.update({
          where: { id: shopId },
          data: { aiUsageMonth: 0, aiUsageResetAt: nextReset },
        });
      } catch {
        this.logger.warn('Could not reset AI usage counter (columns may not exist yet)');
      }
      return;
    }

    if (monthlyQuota !== -1 && currentUsage >= monthlyQuota) {
      throw new BadRequestException(
        `تم تجاوز الحد الشهري (${monthlyQuota} طلب). قم بالترقية للحصول على المزيد.`,
      );
    }
  }

  private async incrementUsage(shopId: string) {
    try {
      await this.prisma.shop.update({
        where: { id: shopId },
        data: { aiUsageMonth: { increment: 1 } },
      });
    } catch {
      this.logger.warn('Could not increment AI usage (columns may not exist yet)');
    }
  }
}

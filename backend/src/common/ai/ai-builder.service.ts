import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { GroqProvider } from './groq.provider';
import { AiAuditService } from './ai-audit.service';
import {
  DesignTokens,
  PageSchema,
  PageSection,
  SectionType,
  SectionLayout,
  BrandIdentity,
  StylePreset,
  DEFAULT_DESIGN_TOKENS,
  DeepPartial,
} from './ai-builder.types';

// ─── Activity → Section mapping ───────────────────────────────

const ACTIVITY_SECTIONS: Record<string, SectionType[]> = {
  restaurant: ['hero', 'menu', 'features', 'gallery', 'testimonials', 'faq', 'contact'],
  grocery: ['hero', 'categories', 'products', 'features', 'cta', 'contact'],
  fashion: ['hero', 'categories', 'products', 'gallery', 'testimonials', 'newsletter', 'contact'],
  homeTextiles: ['hero', 'categories', 'products', 'gallery', 'about', 'contact'],
  fabricStore: ['hero', 'categories', 'products', 'about', 'contact'],
  curtainsBlinds: ['hero', 'services', 'gallery', 'about', 'testimonials', 'contact'],
  sofasUpholstery: ['hero', 'services', 'gallery', 'about', 'contact'],
  mattressesBedding: ['hero', 'categories', 'products', 'features', 'contact'],
  furniture: ['hero', 'categories', 'gallery', 'about', 'projects', 'contact'],
  homeGoods: ['hero', 'categories', 'products', 'features', 'contact'],
  goldJewelry: ['hero', 'categories', 'products', 'gallery', 'about', 'contact'],
  silverAccessories: ['hero', 'categories', 'products', 'gallery', 'contact'],
  watchesGifts: ['hero', 'categories', 'products', 'gallery', 'about', 'contact'],
  realEstate: ['hero', 'products', 'features', 'stats', 'testimonials', 'faq', 'contact'],
  lands: ['hero', 'products', 'features', 'contact'],
  contractors: ['hero', 'services', 'projects', 'stats', 'testimonials', 'faq', 'contact'],
  building_supplies: ['hero', 'categories', 'products', 'contact'],
  carShowroom: ['hero', 'products', 'features', 'gallery', 'testimonials', 'contact'],
  auto_services: ['hero', 'services', 'features', 'stats', 'testimonials', 'contact'],
  auto_parts: ['hero', 'categories', 'products', 'features', 'contact'],
  agri_supplies: ['hero', 'categories', 'products', 'features', 'contact'],
  nurseries_landscaping: ['hero', 'services', 'gallery', 'about', 'contact'],
  serviceCompanies: ['hero', 'services', 'features', 'stats', 'testimonials', 'faq', 'contact'],
  individualTechnicians: ['hero', 'services', 'gallery', 'testimonials', 'contact'],
  workshops: ['hero', 'services', 'gallery', 'about', 'contact'],
  electronics: ['hero', 'categories', 'products', 'features', 'gallery', 'contact'],
  health: ['hero', 'categories', 'products', 'features', 'contact'],
  factories: ['hero', 'products', 'features', 'stats', 'about', 'contact'],
  tradeCompanies: ['hero', 'categories', 'products', 'features', 'about', 'contact'],
  tourismTravel: ['hero', 'services', 'gallery', 'testimonials', 'faq', 'contact'],
  livestock: ['hero', 'categories', 'products', 'features', 'contact'],
  fisheries: ['hero', 'categories', 'products', 'features', 'contact'],
  energy: ['hero', 'services', 'products', 'features', 'stats', 'contact'],
  professionalServices: ['hero', 'services', 'features', 'team', 'testimonials', 'faq', 'contact'],
  homeServices: ['hero', 'services', 'features', 'gallery', 'testimonials', 'contact'],
  other: ['hero', 'products', 'features', 'about', 'contact'],
};

// ─── Style Preset → Design Tokens mapping ─────────────────────

const PRESET_TOKENS: Record<StylePreset, DeepPartial<DesignTokens>> = {
  modern: {
    colors: { primary: '#00E5FF', secondary: '#BD00FF', accent: '#0F172A', background: '#FFFFFF', surface: '#F8FAFC' },
    radius: { card: '2xl', button: '2xl', input: 'xl' },
    shadow: { card: 'md', button: 'sm' },
    cardStyle: { layout: 'standard', imageAspect: 'square', showShadow: true, showBorder: true },
  },
  luxury: {
    colors: { primary: '#D97706', secondary: '#78350F', accent: '#111827', background: '#FFFBEB', surface: '#FEFCE8' },
    radius: { card: 'lg', button: 'lg', input: 'lg' },
    shadow: { card: 'lg', button: 'sm' },
    cardStyle: { layout: 'overlay', imageAspect: 'portrait', showShadow: true, showBorder: false },
  },
  minimal: {
    colors: { primary: '#0F172A', secondary: '#334155', accent: '#64748B', background: '#FFFFFF', surface: '#F8FAFC' },
    radius: { card: 'md', button: 'md', input: 'md' },
    shadow: { card: 'sm', button: 'none' },
    cardStyle: { layout: 'minimal', imageAspect: 'square', showShadow: false, showBorder: true },
  },
  glass: {
    colors: { primary: '#0EA5E9', secondary: '#6366F1', accent: '#0F172A', background: '#F0F9FF', surface: '#FFFFFF' },
    radius: { card: '2xl', button: 'xl', input: 'xl' },
    shadow: { card: 'lg', button: 'sm' },
    cardStyle: { layout: 'glass', imageAspect: 'landscape', showShadow: true, showBorder: false },
  },
  dark: {
    colors: { primary: '#00E5FF', secondary: '#BD00FF', accent: '#E0F2FE', background: '#0F172A', surface: '#1E293B', text: '#F1F5F9', textMuted: '#94A3B8', headerBg: '#0F172A', headerText: '#F1F5F9', footerBg: '#020617', footerText: '#94A3B8' },
    radius: { card: 'xl', button: 'xl', input: 'lg' },
    shadow: { card: 'lg', button: 'sm' },
    cardStyle: { layout: 'glass', imageAspect: 'landscape', showShadow: true, showBorder: false },
  },
  elegant: {
    colors: { primary: '#64748B', secondary: '#334155', accent: '#0F172A', background: '#F8FAFC', surface: '#FFFFFF' },
    radius: { card: 'lg', button: 'lg', input: 'lg' },
    shadow: { card: 'md', button: 'sm' },
    cardStyle: { layout: 'standard', imageAspect: 'portrait', showShadow: true, showBorder: true },
  },
  corporate: {
    colors: { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#0F172A', background: '#FFFFFF', surface: '#F8FAFC' },
    radius: { card: 'md', button: 'md', input: 'md' },
    shadow: { card: 'md', button: 'sm' },
    cardStyle: { layout: 'standard', imageAspect: 'landscape', showShadow: true, showBorder: true },
  },
  playful: {
    colors: { primary: '#F59E0B', secondary: '#EC4899', accent: '#7C3AED', background: '#FFFBEB', surface: '#FEFCE8' },
    radius: { card: 'full', button: 'full', input: 'xl' },
    shadow: { card: 'lg', button: 'md' },
    cardStyle: { layout: 'standard', imageAspect: 'square', showShadow: true, showBorder: false },
  },
  bold: {
    colors: { primary: '#DC2626', secondary: '#111827', accent: '#FCD34D', background: '#FFFFFF', surface: '#F9FAFB' },
    radius: { card: 'none', button: 'none', input: 'none' },
    shadow: { card: 'none', button: 'none' },
    cardStyle: { layout: 'standard', imageAspect: 'square', showShadow: false, showBorder: true },
  },
};

// ─── System Prompts ───────────────────────────────────────────

const BUILDER_SYSTEM_PROMPT = `You are an AI Brand & Page Builder for a merchant platform.
You help merchants create complete store themes, brand identities, and page layouts.

CRITICAL SECURITY RULES:
- You NEVER generate HTML, CSS, JavaScript, or any executable code.
- You ONLY output JSON data (design tokens, page schemas, brand identity).
- All output must be valid JSON that the frontend renders into pre-built React components.

DESIGN TOKENS you can control:
- colors: primary, secondary, accent, background, surface, text, textMuted, headerBg, headerText, footerBg, footerText
- typography: fontFamily, headingFamily, headingSize (sm|base|lg|xl), textSize (xs|sm|base|lg), fontWeight (normal|medium|bold|black)
- spacing: sectionGap (compact|normal|loose), itemGap (tight|normal|wide), pagePadding (none|sm|md|lg)
- radius: card, button, input (none|sm|md|lg|xl|2xl|full)
- shadow: card, button (none|sm|md|lg|xl)
- animation: entrance (none|fade|slide-up|slide-right|scale), duration (fast|normal|slow)
- buttonStyle: shape (solid|outline|ghost|gradient), size (sm|md|lg), fullWidth (boolean)
- cardStyle: layout (standard|overlay|minimal|glass), imageAspect (square|portrait|landscape), showShadow, showBorder

PAGE SECTIONS you can create:
- hero, features, products, categories, testimonials, gallery, faq, cta, contact, about, services, projects, booking, providers, menu, map, stats, team, newsletter, social, custom

SECTION LAYOUTS: grid, list, carousel, masonry, full-width, split

STYLE PRESETS: modern, luxury, minimal, glass, dark, elegant, corporate, playful, bold

Always respond in the same language the user writes in (Arabic or English).
When generating a theme, consider the business activity and suggest appropriate colors, fonts, and layouts.
When generating pages, create sections relevant to the business activity.`;

function buildGenerationPrompt(
  task: 'theme' | 'pages' | 'brand' | 'chat',
  activityId: string,
  shopName: string,
  shopDescription: string,
  locale: string,
  stylePreset?: StylePreset,
  userMessage?: string,
  currentDesign?: any,
): string {
  const isArabic = locale?.startsWith('ar') ?? true;
  const langInstruction = isArabic ? 'Respond in Arabic.' : 'Respond in English.';

  const baseContext = `BUSINESS CONTEXT:
- Shop name: ${shopName}
- Activity ID: ${activityId}
- Shop description: ${shopDescription || 'N/A'}
- Style preference: ${stylePreset || 'auto (choose based on activity)'}
- Language: ${locale || 'ar'}
${langInstruction}`;

  switch (task) {
    case 'theme':
      return `${baseContext}

TASK: Generate a complete theme for this business.
Return a JSON object with this exact structure:
{
  "designTokens": { ... full DesignTokens object ... },
  "brandIdentity": {
    "brandName": "...",
    "tagline": "...",
    "description": "...",
    "colors": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "surface": "#...", "text": "#..." },
    "typography": { "fontFamily": "...", "headingFamily": "...", "fontWeight": "..." },
    "stylePreset": "modern|luxury|minimal|glass|dark|elegant|corporate|playful|bold",
    "iconSet": "lucide",
    "cardStyle": "standard|overlay|minimal|glass",
    "buttonShape": "solid|outline|ghost|gradient",
    "bannerText": "...",
    "heroText": "...",
    "suggestedImages": ["url1", "url2"]
  },
  "pageSchema": {
    "version": "1.0.0",
    "sections": [ ... sections relevant to activity ... ]
  }
}

Choose colors and style that fit the "${activityId}" business activity.
Generate 5-8 sections appropriate for this activity type.`;

    case 'pages':
      return `${baseContext}

TASK: Generate page schemas for this business.
Return a JSON object with this exact structure:
{
  "pages": {
    "home": { "version": "1.0.0", "sections": [...] },
    "about": { "version": "1.0.0", "sections": [...] },
    "services": { "version": "1.0.0", "sections": [...] },
    "contact": { "version": "1.0.0", "sections": [...] }
  }
}

Generate pages with sections appropriate for "${activityId}".
Each section needs: id, type, layout, title, subtitle, visible, content, style.`;

    case 'brand':
      return `${baseContext}

TASK: Generate a brand identity for this business.
Return a JSON object with this exact structure:
{
  "brandName": "...",
  "tagline": "...",
  "description": "...",
  "colors": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "surface": "#...", "text": "#..." },
  "typography": { "fontFamily": "...", "headingFamily": "...", "fontWeight": "..." },
  "stylePreset": "modern|luxury|minimal|glass|dark|elegant|corporate|playful|bold",
  "iconSet": "lucide",
  "cardStyle": "standard|overlay|minimal|glass",
  "buttonShape": "solid|outline|ghost|gradient",
  "bannerText": "...",
  "heroText": "...",
  "suggestedImages": ["url1", "url2"]
}

Create a brand identity that fits the "${activityId}" business activity.
The tagline and description should be compelling and professional.`;

    case 'chat':
      return `${baseContext}

CURRENT DESIGN STATE:
${currentDesign ? JSON.stringify(currentDesign, null, 2) : 'No design yet'}

USER REQUEST: ${userMessage}

TASK: Based on the user's request, generate updated design tokens and/or page schema.
Return a JSON object with this structure:
{
  "reply": "Brief explanation of what you changed (in the user's language)",
  "designTokens": { ... partial or full DesignTokens with only changed fields ... },
  "pageSchema": { ... partial PageSchema with updated sections ... },
  "brandIdentity": { ... partial BrandIdentity if relevant ... },
  "applied": true
}

Only include fields that need to change. If the user asks about something unrelated to design, set "applied": false and explain in "reply".`;
  }
}

@Injectable()
export class AiBuilderService {
  private readonly logger = new Logger(AiBuilderService.name);
  private readonly provider: GroqProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AiAuditService,
  ) {
    this.provider = new GroqProvider({
      apiKey: String(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || 'ollama'),
      model: String(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
      baseUrl: process.env.AI_BASE_URL || process.env.OLLAMA_BASE_URL || undefined,
    });
    this.logger.log(`AI Provider config: model=${this.provider['model']}, baseUrl=${this.provider['baseUrl']}, apiKey=${String(this.provider['apiKey']).slice(0, 10)}...`);
  }

  // ─── Generate Complete Theme ────────────────────────────────

  async generateTheme(params: {
    activityId: string;
    shopName: string;
    shopDescription?: string;
    stylePreset?: StylePreset;
    locale?: string;
    shopId?: string;
  }) {
    const { activityId, shopName, shopDescription, stylePreset, locale = 'ar', shopId } = params;

    // 1. Try LLM generation
    try {
      const prompt = buildGenerationPrompt('theme', activityId, shopName, shopDescription || '', locale, stylePreset);
      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: BUILDER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        maxTokens: 4096,
        temperature: 0.4,
      });

      const parsed = this.extractJson(response.content);
      if (parsed) {
        // Merge with defaults to ensure completeness
        const designTokens = this.mergeDesignTokens(DEFAULT_DESIGN_TOKENS, parsed.designTokens);
        const pageSchema = this.normalizePageSchema(parsed.pageSchema);
        const brandIdentity = parsed.brandIdentity || {};

        if (shopId) {
          await this.auditService.logActionStart({
            shopId,
            action: 'ai_builder:generate_theme',
            params: { activityId, stylePreset },
            riskLevel: 'LOW',
          });
        }

        return { designTokens, brandIdentity, pageSchema };
      }
    } catch (err: any) {
      this.logger.warn(`LLM theme generation failed, using fallback: ${err.message}`);
    }

    // 2. Fallback: generate from presets + activity sections
    return this.generateFallbackTheme(activityId, shopName, stylePreset, locale);
  }

  // ─── Generate Pages ─────────────────────────────────────────

  async generatePages(params: {
    activityId: string;
    shopName: string;
    shopDescription?: string;
    locale?: string;
    pages?: string[];
    shopId?: string;
  }) {
    const { activityId, shopName, shopDescription, locale = 'ar', pages, shopId } = params;

    try {
      const prompt = buildGenerationPrompt('pages', activityId, shopName, shopDescription || '', locale);
      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: BUILDER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        maxTokens: 4096,
        temperature: 0.4,
      });

      const parsed = this.extractJson(response.content);
      if (parsed?.pages) {
        const normalized: Record<string, PageSchema> = {};
        for (const [pageName, schema] of Object.entries(parsed.pages)) {
          normalized[pageName] = this.normalizePageSchema(schema);
        }
        return { pages: normalized };
      }
    } catch (err: any) {
      this.logger.warn(`LLM page generation failed, using fallback: ${err.message}`);
    }

    // Fallback
    return this.generateFallbackPages(activityId, pages || ['home', 'about', 'services', 'contact']);
  }

  // ─── Generate Brand Identity ────────────────────────────────

  async generateBrand(params: {
    activityId: string;
    shopName: string;
    shopDescription?: string;
    locale?: string;
    shopId?: string;
  }) {
    const { activityId, shopName, shopDescription, locale = 'ar', shopId } = params;

    try {
      const prompt = buildGenerationPrompt('brand', activityId, shopName, shopDescription || '', locale);
      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: BUILDER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        maxTokens: 2048,
        temperature: 0.5,
      });

      const parsed = this.extractJson(response.content);
      if (parsed) {
        if (shopId) {
          await this.auditService.logActionStart({
            shopId,
            action: 'ai_builder:generate_brand',
            params: { activityId },
            riskLevel: 'LOW',
          });
        }
        return parsed as Partial<BrandIdentity>;
      }
    } catch (err: any) {
      this.logger.warn(`LLM brand generation failed, using fallback: ${err.message}`);
    }

    // Fallback
    return this.generateFallbackBrand(activityId, shopName, locale);
  }

  // ─── Chat-based Builder ─────────────────────────────────────

  async chat(params: {
    shopId: string;
    message: string;
    context?: { currentPage?: string; locale?: string; activityId?: string; selectedSectionId?: string };
  }) {
    const { shopId, message, context } = params;
    const locale = context?.locale || 'ar';

    // Load shop
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true, name: true, category: true,
        pageDesign: true, customColors: true,
      },
    });

    if (!shop) throw new BadRequestException('Shop not found');

    const activityId = context?.activityId || (shop.pageDesign as any)?.businessActivityId || 'other';
    const currentDesign = {
      pageDesign: shop.pageDesign,
      customColors: shop.customColors,
    };

    try {
      const prompt = buildGenerationPrompt(
        'chat',
        activityId,
        shop.name,
        '',
        locale,
        undefined,
        message,
        currentDesign,
      );

      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: BUILDER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        maxTokens: 4096,
        temperature: 0.3,
      });

      const parsed = this.extractJson(response.content);
      if (parsed) {
        // Apply changes to shop design if applicable
        if (parsed.applied && (parsed.designTokens || parsed.pageSchema)) {
          await this.applyDesignChanges(shopId, parsed);
        }

        return {
          reply: parsed.reply || (locale === 'ar' ? 'تم تطبيق التغييرات بنجاح.' : 'Changes applied successfully.'),
          designTokens: parsed.designTokens,
          pageSchema: parsed.pageSchema,
          brandIdentity: parsed.brandIdentity,
          applied: Boolean(parsed.applied),
        };
      }

      // If no JSON parsed, return the text as reply
      return {
        reply: response.content || (locale === 'ar' ? 'لم أتمكن من فهم الطلب.' : 'Could not process the request.'),
        applied: false,
      };
    } catch (err: any) {
      this.logger.error(`Builder chat error: ${err.message}`, err.stack);
      throw new BadRequestException(err.message || 'AI builder error');
    }
  }

  // ─── Visual Editor: Element-specific AI changes ──────────────

  async visualEdit(params: {
    shopId: string;
    componentName: string;
    elementInspection: any;
    userPrompt: string;
    locale?: string;
  }): Promise<{
    reply: string;
    change: any;
    applied: boolean;
  }> {
    const { shopId, componentName, elementInspection, userPrompt, locale = 'ar' } = params;
    this.logger.log(`Visual edit for shop ${shopId}: ${componentName} — ${userPrompt.slice(0, 80)}`);

    const isArabic = locale.startsWith('ar');
    const langInstruction = isArabic ? 'Respond in Arabic.' : 'Respond in English.';

    const ALLOWED_COMPONENTS = [
      'Hero', 'ProductsGrid', 'Testimonials', 'Cards', 'Navbar', 'Footer',
      'Gallery', 'FAQ', 'Pricing', 'Contact', 'Booking', 'Banner',
      'Features', 'Stats', 'Team', 'Services', 'Projects', 'Newsletter',
      'Social', 'CTA', 'About', 'Menu', 'Map', 'Custom',
    ];

    if (!ALLOWED_COMPONENTS.includes(componentName)) {
      return {
        reply: isArabic ? 'هذا المكون غير مسموح بتعديله.' : 'This component is not allowed for editing.',
        change: null,
        applied: false,
      };
    }

    const prompt = `You are an AI Visual Editor for a merchant platform.
${langInstruction}

CRITICAL SECURITY RULES:
- You NEVER generate HTML, CSS, JavaScript, or any executable code.
- You ONLY output JSON data.
- All changes are applied as design tokens, not code.

SELECTED COMPONENT: ${componentName}

ELEMENT INSPECTION DATA:
- DOM Path: ${elementInspection?.domPath || 'N/A'}
- Text Content: ${elementInspection?.textContent?.slice(0, 200) || 'N/A'}
- Computed Styles: ${JSON.stringify(elementInspection?.computedStyles || {})}
- Images: ${JSON.stringify(elementInspection?.images || [])}
- Parent Component: ${elementInspection?.parentComponent || 'N/A'}
- Child Components: ${JSON.stringify(elementInspection?.childComponents || [])}
- Bounding Rect: ${JSON.stringify(elementInspection?.boundingRect || {})}

USER REQUEST: ${userPrompt}

TASK: Based on the user's request, generate a JSON object with the visual changes for the "${componentName}" component.
Return EXACTLY this JSON structure:
{
  "reply": "Brief explanation of what you changed (in the user's language)",
  "change": {
    "component": "${componentName}",
    "changes": {
      "variant": "modern|luxury|minimal|glass|dark|elegant|apple|custom",
      "primaryColor": "#hex",
      "secondaryColor": "#hex",
      "backgroundColor": "#hex",
      "textColor": "#hex",
      "fontFamily": "font name",
      "fontSize": "sm|base|lg|xl",
      "fontWeight": "normal|medium|bold|black",
      "buttonStyle": "solid|outline|ghost|gradient",
      "borderRadius": "none|sm|md|lg|xl|2xl|full",
      "spacing": "compact|normal|loose",
      "shadow": "none|sm|md|lg|xl",
      "animation": "none|fade|slide-up|slide-right|scale",
      "layout": "grid|list|carousel|masonry|full-width|split",
      "columns": 3,
      "imageAspect": "square|portrait|landscape",
      "showBorder": true,
      "showShadow": true,
      "gradient": "linear-gradient(...)",
      "borderColor": "#hex"
    },
    "contentChanges": {
      "title": "new title if needed",
      "subtitle": "new subtitle if needed",
      "buttonText": "new button text if needed",
      "description": "new description if needed"
    }
  },
  "applied": true
}

Only include fields that need to change. If the request is unrelated to visual design, set "applied": false.`;

    try {
      const response = await this.provider.chat({
        messages: [
          { role: 'system', content: BUILDER_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        maxTokens: 1500,
      });

      const jsonContent = this.extractJson(response.content);
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        return {
          reply: parsed.reply || (isArabic ? 'تم تطبيق التغييرات.' : 'Changes applied.'),
          change: parsed.change || null,
          applied: Boolean(parsed.applied),
        };
      }

      return {
        reply: response.content || (isArabic ? 'لم أتمكن من فهم الطلب.' : 'Could not process.'),
        change: null,
        applied: false,
      };
    } catch (err: any) {
      this.logger.error(`Visual edit error: ${err.message}`, err.stack);

      // Fallback: generate a simple change based on the prompt
      const fallbackChange = this.generateFallbackVisualChange(componentName, userPrompt, isArabic);
      return {
        reply: isArabic ? 'تم تطبيق تغييرات افتراضية.' : 'Applied default changes.',
        change: fallbackChange,
        applied: true,
      };
    }
  }

  private generateFallbackVisualChange(componentName: string, userPrompt: string, isArabic: boolean): any {
    const prompt = userPrompt.toLowerCase();
    let changes: any = {};

    if (prompt.includes('عصري') || prompt.includes('modern')) {
      changes = { variant: 'modern', primaryColor: '#00E5FF', secondaryColor: '#BD00FF', borderRadius: '2xl', shadow: 'md', animation: 'fade' };
    } else if (prompt.includes('فاخر') || prompt.includes('luxury')) {
      changes = { variant: 'luxury', primaryColor: '#D97706', secondaryColor: '#78350F', borderRadius: 'lg', shadow: 'lg', animation: 'fade' };
    } else if (prompt.includes('داكن') || prompt.includes('dark')) {
      changes = { variant: 'dark', primaryColor: '#00E5FF', secondaryColor: '#BD00FF', backgroundColor: '#0F172A', borderRadius: 'lg', shadow: 'lg', animation: 'fade' };
    } else if (prompt.includes('بسيط') || prompt.includes('minimal')) {
      changes = { variant: 'minimal', primaryColor: '#0F172A', secondaryColor: '#334155', borderRadius: 'sm', shadow: 'none', animation: 'none' };
    } else if (prompt.includes('زجاج') || prompt.includes('glass')) {
      changes = { variant: 'glass', primaryColor: '#0EA5E9', secondaryColor: '#6366F1', borderRadius: '2xl', shadow: 'md', animation: 'scale' };
    } else if (prompt.includes('أنيق') || prompt.includes('elegant')) {
      changes = { variant: 'elegant', primaryColor: '#64748B', secondaryColor: '#334155', borderRadius: 'lg', shadow: 'sm', animation: 'fade' };
    } else {
      changes = { variant: 'modern', borderRadius: 'xl', shadow: 'md', animation: 'fade' };
    }

    return {
      component: componentName,
      changes,
      contentChanges: {},
    };
  }

  // ─── Apply Design Changes to Shop ───────────────────────────

  private async applyDesignChanges(shopId: string, changes: any) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { pageDesign: true, customColors: true },
    });

    const currentDesign = (shop?.pageDesign as any) || {};
    const currentColors = (shop?.customColors as any) || {};

    // Merge design tokens into pageDesign
    if (changes.designTokens) {
      const tokens = changes.designTokens;
      if (tokens.colors) {
        if (tokens.colors.primary) currentDesign.primaryColor = tokens.colors.primary;
        if (tokens.colors.secondary) currentDesign.secondaryColor = tokens.colors.secondary;
        if (tokens.colors.background) currentDesign.pageBackgroundColor = tokens.colors.background;
        if (tokens.colors.headerBg) currentDesign.headerBackgroundColor = tokens.colors.headerBg;
        if (tokens.colors.headerText) currentDesign.headerTextColor = tokens.colors.headerText;
        if (tokens.colors.footerBg) currentDesign.footerBackgroundColor = tokens.colors.footerBg;
        if (tokens.colors.footerText) currentDesign.footerTextColor = tokens.colors.footerText;

        // Update customColors
        currentColors.primary = tokens.colors.primary;
        currentColors.secondary = tokens.colors.secondary;
        if (tokens.colors.accent) currentColors.accent = tokens.colors.accent;
      }
      if (tokens.typography) {
        if (tokens.typography.headingSize) currentDesign.headingSize = `text-${tokens.typography.headingSize === 'xl' ? '4xl' : tokens.typography.headingSize === 'lg' ? '3xl' : tokens.typography.headingSize === 'base' ? '2xl' : 'xl'}`;
        if (tokens.typography.textSize) currentDesign.textSize = `text-${tokens.typography.textSize}`;
        if (tokens.typography.fontWeight) currentDesign.fontWeight = `font-${tokens.typography.fontWeight}`;
      }
      if (tokens.radius) {
        if (tokens.radius.button) currentDesign.buttonShape = this.radiusToTailwind(tokens.radius.button);
        if (tokens.radius.card) currentDesign.productCardOverlayBgColor = currentDesign.productCardOverlayBgColor;
      }
      if (tokens.cardStyle) {
        if (tokens.cardStyle.imageAspect) currentDesign.imageAspectRatio = tokens.cardStyle.imageAspect;
        if (tokens.cardStyle.layout === 'overlay') currentDesign.productDisplay = 'cards';
        if (tokens.cardStyle.layout === 'minimal') currentDesign.productDisplay = 'minimal';
      }
      if (tokens.buttonStyle) {
        if (tokens.buttonStyle.shape === 'gradient') currentDesign.buttonPreset = 'primary';
        if (tokens.buttonStyle.shape === 'outline') currentDesign.buttonPreset = 'ghost';
      }
    }

    // Merge page schema sections
    if (changes.pageSchema?.sections) {
      currentDesign.aiSections = changes.pageSchema.sections;
    }

    // Merge brand identity
    if (changes.brandIdentity) {
      if (changes.brandIdentity.bannerText) currentDesign.bannerTitle = changes.brandIdentity.bannerText;
      if (changes.brandIdentity.heroText) currentDesign.bannerSubtitle = changes.brandIdentity.heroText;
      if (changes.brandIdentity.stylePreset) currentDesign.quickTheme = `ai_${changes.brandIdentity.stylePreset}`;
    }

    await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        pageDesign: currentDesign,
        customColors: currentColors,
      },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────

  private extractJson(content: string): any | null {
    if (!content) return null;
    try {
      // Try direct parse
      return JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {}
      }
      // Try finding first { and last }
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(content.slice(firstBrace, lastBrace + 1));
        } catch {}
      }
      return null;
    }
  }

  private mergeDesignTokens(base: DesignTokens, partial?: any): DesignTokens {
    if (!partial) return base;
    return {
      colors: { ...base.colors, ...(partial.colors || {}) },
      typography: { ...base.typography, ...(partial.typography || {}) },
      spacing: { ...base.spacing, ...(partial.spacing || {}) },
      radius: { ...base.radius, ...(partial.radius || {}) },
      shadow: { ...base.shadow, ...(partial.shadow || {}) },
      animation: { ...base.animation, ...(partial.animation || {}) },
      buttonStyle: { ...base.buttonStyle, ...(partial.buttonStyle || {}) },
      cardStyle: { ...base.cardStyle, ...(partial.cardStyle || {}) },
    };
  }

  private normalizePageSchema(schema?: any): PageSchema {
    if (!schema) return { version: '1.0.0', sections: [] };
    const sections: PageSection[] = (Array.isArray(schema.sections) ? schema.sections : []).map((s: any, idx: number) => ({
      id: s.id || `section-${idx}`,
      type: s.type || 'custom',
      layout: s.layout || 'grid',
      title: s.title || '',
      subtitle: s.subtitle || '',
      visible: s.visible !== false,
      content: s.content || {},
      style: s.style || {},
    }));
    return { version: schema.version || '1.0.0', sections };
  }

  private radiusToTailwind(radius: string): string {
    const map: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };
    return map[radius] || 'rounded-2xl';
  }

  // ─── Fallback Generations (no LLM needed) ───────────────────

  private generateFallbackTheme(activityId: string, shopName: string, stylePreset?: StylePreset, locale = 'ar') {
    const preset: StylePreset = stylePreset || this.guessPresetForActivity(activityId);
    const presetTokens = PRESET_TOKENS[preset] || PRESET_TOKENS.modern;
    const designTokens = this.mergeDesignTokens(DEFAULT_DESIGN_TOKENS, presetTokens);

    const sectionTypes = ACTIVITY_SECTIONS[activityId] || ACTIVITY_SECTIONS.other;
    const sections: PageSection[] = sectionTypes.map((type, idx) => ({
      id: `section-${idx}`,
      type,
      layout: this.guessLayoutForSection(type),
      title: this.guessSectionTitle(type, locale),
      subtitle: '',
      visible: true,
      content: {},
      style: { columns: this.guessColumnsForSection(type) },
    }));

    const isAr = locale.startsWith('ar');
    return {
      designTokens,
      brandIdentity: {
        brandName: shopName,
        tagline: isAr ? `وجهتك المثالية لـ ${shopName}` : `Your perfect destination for ${shopName}`,
        description: isAr ? `${shopName} — جودة وخدمة متميزة` : `${shopName} — Quality and outstanding service`,
        stylePreset: preset,
        colors: {
          primary: designTokens.colors.primary,
          secondary: designTokens.colors.secondary,
          accent: designTokens.colors.accent,
          background: designTokens.colors.background,
          surface: designTokens.colors.surface,
          text: designTokens.colors.text,
        },
        typography: {
          fontFamily: designTokens.typography.fontFamily,
          headingFamily: designTokens.typography.headingFamily,
          fontWeight: designTokens.typography.fontWeight,
        },
        iconSet: 'lucide',
        cardStyle: designTokens.cardStyle.layout,
        buttonShape: designTokens.buttonStyle.shape,
        bannerText: isAr ? `أهلاً بكم في ${shopName}` : `Welcome to ${shopName}`,
        heroText: isAr ? 'اكتشف مجموعتنا المميزة' : 'Discover our premium collection',
        suggestedImages: [],
      } as Partial<BrandIdentity>,
      pageSchema: { version: '1.0.0', sections },
    };
  }

  private generateFallbackPages(activityId: string, pages: string[]) {
    const sectionTypes = ACTIVITY_SECTIONS[activityId] || ACTIVITY_SECTIONS.other;
    const result: Record<string, PageSchema> = {};

    for (const pageName of pages) {
      let sections: PageSection[];
      if (pageName === 'home') {
        sections = sectionTypes.map((type, idx) => ({
          id: `home-${idx}`,
          type,
          layout: this.guessLayoutForSection(type),
          title: this.guessSectionTitle(type, 'ar'),
          subtitle: '',
          visible: true,
          content: {},
          style: {},
        }));
      } else if (pageName === 'about') {
        sections = [
          { id: 'about-hero', type: 'hero', layout: 'full-width', title: 'من نحن', subtitle: '', visible: true, content: {}, style: {} },
          { id: 'about-stats', type: 'stats', layout: 'grid', title: 'إنجازاتنا', subtitle: '', visible: true, content: {}, style: { columns: 4 } },
          { id: 'about-team', type: 'team', layout: 'grid', title: 'فريقنا', subtitle: '', visible: true, content: {}, style: { columns: 3 } },
        ];
      } else if (pageName === 'services') {
        sections = [
          { id: 'srv-hero', type: 'hero', layout: 'full-width', title: 'خدماتنا', subtitle: '', visible: true, content: {}, style: {} },
          { id: 'srv-list', type: 'services', layout: 'grid', title: '', subtitle: '', visible: true, content: {}, style: { columns: 3 } },
        ];
      } else if (pageName === 'contact') {
        sections = [
          { id: 'contact-info', type: 'contact', layout: 'split', title: 'تواصل معنا', subtitle: '', visible: true, content: {}, style: {} },
          { id: 'contact-map', type: 'map', layout: 'full-width', title: '', subtitle: '', visible: true, content: {}, style: {} },
        ];
      } else {
        sections = [{ id: `${pageName}-1`, type: 'custom', layout: 'grid', title: pageName, subtitle: '', visible: true, content: {}, style: {} }];
      }
      result[pageName] = { version: '1.0.0', sections };
    }

    return { pages: result };
  }

  private generateFallbackBrand(activityId: string, shopName: string, locale = 'ar'): Partial<BrandIdentity> {
    const preset = this.guessPresetForActivity(activityId);
    const presetTokens = PRESET_TOKENS[preset] || PRESET_TOKENS.modern;
    const isAr = locale.startsWith('ar');
    return {
      brandName: shopName,
      tagline: isAr ? `وجهتك المثالية` : `Your perfect destination`,
      description: isAr ? `${shopName} — جودة وخدمة متميزة` : `${shopName} — Quality and outstanding service`,
      colors: {
        primary: presetTokens.colors?.primary || '#00E5FF',
        secondary: presetTokens.colors?.secondary || '#BD00FF',
        accent: presetTokens.colors?.accent || '#0F172A',
        background: presetTokens.colors?.background || '#FFFFFF',
        surface: presetTokens.colors?.surface || '#F8FAFC',
        text: presetTokens.colors?.text || '#0F172A',
      },
      typography: { fontFamily: 'Cairo', headingFamily: 'Cairo', fontWeight: 'bold' },
      stylePreset: preset,
      iconSet: 'lucide',
      cardStyle: presetTokens.cardStyle?.layout || 'standard',
      buttonShape: presetTokens.buttonStyle?.shape || 'solid',
      bannerText: isAr ? `أهلاً بكم في ${shopName}` : `Welcome to ${shopName}`,
      heroText: isAr ? 'اكتشف مجموعتنا المميزة' : 'Discover our premium collection',
      suggestedImages: [],
    };
  }

  private guessPresetForActivity(activityId: string): StylePreset {
    const map: Record<string, StylePreset> = {
      restaurant: 'bold',
      grocery: 'modern',
      fashion: 'elegant',
      goldJewelry: 'luxury',
      silverAccessories: 'elegant',
      watchesGifts: 'elegant',
      realEstate: 'corporate',
      electronics: 'dark',
      health: 'minimal',
      carShowroom: 'bold',
      auto_services: 'bold',
      professionalServices: 'corporate',
      tourismTravel: 'glass',
    };
    return map[activityId] || 'modern';
  }

  private guessLayoutForSection(type: SectionType): SectionLayout {
    const map: Record<SectionType, SectionLayout> = {
      hero: 'full-width',
      features: 'grid',
      products: 'grid',
      categories: 'grid',
      testimonials: 'carousel',
      gallery: 'masonry',
      faq: 'list',
      cta: 'full-width',
      contact: 'split',
      about: 'full-width',
      services: 'grid',
      projects: 'masonry',
      booking: 'full-width',
      providers: 'grid',
      menu: 'list',
      map: 'full-width',
      stats: 'grid',
      team: 'grid',
      newsletter: 'full-width',
      social: 'list',
      custom: 'grid',
    };
    return map[type] || 'grid';
  }

  private guessSectionTitle(type: SectionType, locale: string): string {
    const isAr = locale.startsWith('ar');
    const mapAr: Record<SectionType, string> = {
      hero: 'الواجهة الرئيسية',
      features: 'مميزاتنا',
      products: 'منتجاتنا',
      categories: 'الأقسام',
      testimonials: 'آراء العملاء',
      gallery: 'معرض الصور',
      faq: 'الأسئلة الشائعة',
      cta: 'اطلب الآن',
      contact: 'تواصل معنا',
      about: 'من نحن',
      services: 'خدماتنا',
      projects: 'مشاريعنا',
      booking: 'احجز الآن',
      providers: 'فريقنا',
      menu: 'القائمة',
      map: 'الموقع',
      stats: 'إنجازاتنا',
      team: 'فريق العمل',
      newsletter: 'النشرة البريدية',
      social: 'تابعنا',
      custom: '',
    };
    const mapEn: Record<SectionType, string> = {
      hero: 'Home', features: 'Features', products: 'Products', categories: 'Categories',
      testimonials: 'Testimonials', gallery: 'Gallery', faq: 'FAQ', cta: 'Order Now',
      contact: 'Contact Us', about: 'About Us', services: 'Our Services', projects: 'Our Projects',
      booking: 'Book Now', providers: 'Our Team', menu: 'Menu', map: 'Location',
      stats: 'Our Stats', team: 'Team', newsletter: 'Newsletter', social: 'Follow Us', custom: '',
    };
    return (isAr ? mapAr : mapEn)[type] || '';
  }

  private guessColumnsForSection(type: SectionType): number {
    const map: Record<SectionType, number> = {
      hero: 1, features: 3, products: 4, categories: 3, testimonials: 1,
      gallery: 3, faq: 1, cta: 1, contact: 2, about: 1, services: 3,
      projects: 2, booking: 1, providers: 3, menu: 2, map: 1, stats: 4,
      team: 3, newsletter: 1, social: 1, custom: 2,
    };
    return map[type] || 2;
  }
}

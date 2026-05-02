/**
 * AI Subscription Tier Configuration
 *
 * FREE    — Basic assistant, limited tools, low quota
 * PRO     — Full design tools, code generation, higher quota
 * ENTERPRISE — Unlimited, multi-agent, proactive AI, custom code
 */

export enum AiTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface AiTierConfig {
  monthlyQuota: number;          // max AI requests per month
  requestsPerMinute: number;    // rate limit
  maxTokensPerRequest: number;  // max output tokens
  allowedTools: string[];       // tool names this tier can use
  codeGeneration: boolean;      // can generate custom code?
  proactiveSuggestions: boolean;// proactive AI suggestions?
  multiAgent: boolean;          // multi-agent routing?
  designPresets: boolean;       // can apply design presets?
  customComponents: number;     // max custom code extensions
}

export const AI_TIER_CONFIGS: Record<AiTier, AiTierConfig> = {
  [AiTier.FREE]: {
    monthlyQuota: 50,
    requestsPerMinute: 5,
    maxTokensPerRequest: 1024,
    allowedTools: [
      'changeThemeColor',
      'toggleModule',
      'updateShopInfo',
      'getShopStatus',
    ],
    codeGeneration: false,
    proactiveSuggestions: false,
    multiAgent: false,
    designPresets: false,
    customComponents: 0,
  },
  [AiTier.PRO]: {
    monthlyQuota: 500,
    requestsPerMinute: 20,
    maxTokensPerRequest: 4096,
    allowedTools: [
      'changeThemeColor',
      'toggleModule',
      'updateShopInfo',
      'getShopStatus',
      'addSection',
      'removeSection',
      'reorderSections',
      'changeSectionLayout',
      'updateSectionContent',
      'applyDesignPreset',
      'suggestDesign',
      'addProduct',
      'createPromotion',
      'updateProduct',
      'generateContent',
    ],
    codeGeneration: true,
    proactiveSuggestions: true,
    multiAgent: false,
    designPresets: true,
    customComponents: 5,
  },
  [AiTier.ENTERPRISE]: {
    monthlyQuota: -1, // unlimited
    requestsPerMinute: 60,
    maxTokensPerRequest: 8192,
    allowedTools: ['*'], // all tools
    codeGeneration: true,
    proactiveSuggestions: true,
    multiAgent: true,
    designPresets: true,
    customComponents: 20,
  },
};

export function getTierConfig(tier: AiTier): AiTierConfig {
  return AI_TIER_CONFIGS[tier] || AI_TIER_CONFIGS[AiTier.FREE];
}

export function isToolAllowedForTier(toolName: string, tier: AiTier): boolean {
  const config = getTierConfig(tier);
  if (config.allowedTools.includes('*')) return true;
  return config.allowedTools.includes(toolName);
}

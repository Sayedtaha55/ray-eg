import { AiToolDefinition } from './ai-provider.interface';

/**
 * Tool Registry — all AI tools with their JSON Schema definitions.
 * Follows Shopify Sidekick's JIT instructions pattern:
 * only tools allowed for the merchant's tier are sent to the LLM.
 */

// ─── Design Tools ────────────────────────────────────────────────

export const CHANGE_THEME_COLOR: AiToolDefinition = {
  name: 'changeThemeColor',
  description:
    'Change a theme color for the shop. Use this when the merchant asks to change colors like primary, secondary, or accent.',
  parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          enum: ['primary', 'secondary', 'accent', 'background', 'text'],
          description: 'Which color slot to change',
        },
        color: {
          type: 'string',
          description: 'The new color value (hex like #3B82F6 or CSS color name)',
        },
      },
      required: ['target', 'color'],
    },
};

export const TOGGLE_MODULE: AiToolDefinition = {
  name: 'toggleModule',
  description:
    'Enable or disable a dashboard module/feature. Use when the merchant wants to show/hide a feature like reservations, gallery, POS, etc.',
  parameters: {
    type: 'object',
    properties: {
      moduleId: {
        type: 'string',
        enum: [
          'overview',
          'products',
          'promotions',
          'builder',
          'settings',
          'gallery',
          'reservations',
          'invoice',
          'sales',
          'customers',
          'reports',
          'pos',
        ],
        description: 'The module to toggle',
      },
      enabled: {
        type: 'boolean',
        description: 'true to enable, false to disable',
      },
    },
    required: ['moduleId', 'enabled'],
  },
};

export const UPDATE_SHOP_INFO: AiToolDefinition = {
  name: 'updateShopInfo',
  description:
    'Update basic shop information like name, description, phone, email, address, opening hours.',
  parameters: {
    type: 'object',
    properties: {
      field: {
        type: 'string',
        enum: ['name', 'description', 'phone', 'email', 'address', 'openingHours'],
        description: 'Which field to update',
      },
      value: {
        type: 'string',
        description: 'The new value',
      },
    },
    required: ['field', 'value'],
  },
};

export const GET_SHOP_STATUS: AiToolDefinition = {
  name: 'getShopStatus',
  description:
    'Get current shop status including active modules, theme colors, and basic info. Use this before making changes to understand the current state.',
  parameters: {
    type: 'object',
    properties: {},
  },
};

// ─── Commerce Tools (PRO+) ───────────────────────────────────────

export const ADD_PRODUCT: AiToolDefinition = {
  name: 'addProduct',
  description: 'Add a new product to the shop.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Product name' },
      price: { type: 'number', description: 'Product price' },
      description: { type: 'string', description: 'Product description' },
      category: { type: 'string', description: 'Product category' },
    },
    required: ['name', 'price'],
  },
};

export const CREATE_PROMOTION: AiToolDefinition = {
  name: 'createPromotion',
  description: 'Create a promotional offer/discount.',
  parameters: {
    type: 'object',
    properties: {
      discount: { type: 'number', description: 'Discount percentage (e.g. 20)' },
      label: { type: 'string', description: 'Offer label/title' },
      startDate: { type: 'string', description: 'Start date (ISO string)' },
      endDate: { type: 'string', description: 'End date (ISO string)' },
    },
    required: ['discount', 'label'],
  },
};

export const UPDATE_PRODUCT: AiToolDefinition = {
  name: 'updateProduct',
  description: 'Update an existing product (price, name, description, active status).',
  parameters: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product ID to update' },
      name: { type: 'string', description: 'New name' },
      price: { type: 'number', description: 'New price' },
      active: { type: 'boolean', description: 'Whether product is active' },
    },
    required: ['productId'],
  },
};

// ─── Design Tools (PRO+) ─────────────────────────────────────────

export const ADD_SECTION: AiToolDefinition = {
  name: 'addSection',
  description:
    'Add a new section to the shop page layout. Sections include testimonials, FAQ, gallery, hero, features, etc.',
  parameters: {
    type: 'object',
    properties: {
      sectionType: {
        type: 'string',
        enum: ['hero', 'features', 'testimonials', 'faq', 'gallery', 'cta', 'contact', 'menu', 'booking', 'products'],
        description: 'Type of section to add',
      },
      position: { type: 'number', description: 'Position index in the page (0-based)' },
    },
    required: ['sectionType'],
  },
};

export const REMOVE_SECTION: AiToolDefinition = {
  name: 'removeSection',
  description: 'Remove a section from the shop page layout.',
  parameters: {
    type: 'object',
    properties: {
      sectionId: { type: 'string', description: 'Section ID to remove' },
    },
    required: ['sectionId'],
  },
};

export const REORDER_SECTIONS: AiToolDefinition = {
  name: 'reorderSections',
  description: 'Reorder sections in the shop page layout.',
  parameters: {
    type: 'object',
    properties: {
      sectionIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of section IDs in the desired order',
      },
    },
    required: ['sectionIds'],
  },
};

export const CHANGE_SECTION_LAYOUT: AiToolDefinition = {
  name: 'changeSectionLayout',
  description: 'Change the layout of a section (grid, list, carousel, etc.).',
  parameters: {
    type: 'object',
    properties: {
      sectionId: { type: 'string', description: 'Section ID' },
      layout: {
        type: 'string',
        enum: ['grid', 'list', 'carousel', 'masonry', 'full-width'],
        description: 'New layout type',
      },
    },
    required: ['sectionId', 'layout'],
  },
};

export const UPDATE_SECTION_CONTENT: AiToolDefinition = {
  name: 'updateSectionContent',
  description: 'Update the content of a section (text, images, data).',
  parameters: {
    type: 'object',
    properties: {
      sectionId: { type: 'string', description: 'Section ID' },
      content: { type: 'object', description: 'New content (key-value pairs)' },
    },
    required: ['sectionId', 'content'],
  },
};

export const APPLY_DESIGN_PRESET: AiToolDefinition = {
  name: 'applyDesignPreset',
  description:
    'Apply a complete design preset to the shop (modern, classic, minimal, etc.). This changes colors, fonts, and layout.',
  parameters: {
    type: 'object',
    properties: {
      presetId: {
        type: 'string',
        enum: ['modern', 'classic', 'minimal', 'bold', 'luxury', 'playful'],
        description: 'Design preset to apply',
      },
    },
    required: ['presetId'],
  },
};

export const SUGGEST_DESIGN: AiToolDefinition = {
  name: 'suggestDesign',
  description:
    'Suggest a design based on the shop category and current state. Returns design recommendations.',
  parameters: {
    type: 'object',
    properties: {
      focus: {
        type: 'string',
        enum: ['conversion', 'branding', 'mobile', 'speed', 'accessibility'],
        description: 'What to optimize for',
      },
    },
  },
};

export const GENERATE_CONTENT: AiToolDefinition = {
  name: 'generateContent',
  description: 'Generate or rewrite text content (product descriptions, SEO text, about section, etc.).',
  parameters: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['product_description', 'seo_meta', 'about', 'hero_text', 'faq'],
        description: 'Type of content to generate',
      },
      context: { type: 'string', description: 'Context or topic for the content' },
      language: { type: 'string', enum: ['ar', 'en'], description: 'Output language' },
    },
    required: ['type', 'context'],
  },
};

// ─── Tool Registry ───────────────────────────────────────────────

const ALL_TOOLS: AiToolDefinition[] = [
  // Free tier
  CHANGE_THEME_COLOR,
  TOGGLE_MODULE,
  UPDATE_SHOP_INFO,
  GET_SHOP_STATUS,
  // Pro tier
  ADD_SECTION,
  REMOVE_SECTION,
  REORDER_SECTIONS,
  CHANGE_SECTION_LAYOUT,
  UPDATE_SECTION_CONTENT,
  APPLY_DESIGN_PRESET,
  SUGGEST_DESIGN,
  ADD_PRODUCT,
  CREATE_PROMOTION,
  UPDATE_PRODUCT,
  GENERATE_CONTENT,
];

const TOOL_MAP = new Map(ALL_TOOLS.map((t) => [t.name, t]));

export function getToolByName(name: string): AiToolDefinition | undefined {
  return TOOL_MAP.get(name);
}

export function getToolsForTier(allowedToolNames: string[]): AiToolDefinition[] {
  if (allowedToolNames.includes('*')) return ALL_TOOLS;
  return ALL_TOOLS.filter((t) => allowedToolNames.includes(t.name));
}

export function getAllToolNames(): string[] {
  return ALL_TOOLS.map((t) => t.name);
}

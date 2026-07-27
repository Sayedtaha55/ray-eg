import { backendPost } from '../httpClient';
import type {
  DesignTokens,
  PageSchema,
  BrandIdentity,
  StylePreset,
} from '@/types/pageSchema';

export interface AiChatResponse {
  reply: string;
  actions: Array<{ type: string; payload: any; confirmed: boolean }>;
  usage?: { promptTokens: number; completionTokens: number; cost: number };
}

export async function aiChatViaBackend(params: {
  message: string;
  shopId: string;
  context?: { currentPage?: string; locale?: string };
}): Promise<AiChatResponse> {
  return await backendPost<AiChatResponse>('/api/v1/ai/chat', params);
}

export async function aiChatStreamViaBackend(params: {
  message: string;
  shopId: string;
  context?: { currentPage?: string; locale?: string };
}): Promise<AiChatResponse> {
  return await backendPost<AiChatResponse>('/api/v1/ai/chat/stream', params);
}

// ─── AI Builder: Theme / Page / Brand Generation ──────────────

export interface GenerateThemeResponse {
  designTokens: DesignTokens;
  brandIdentity: Partial<BrandIdentity>;
  pageSchema: PageSchema;
}

export async function aiGenerateTheme(params: {
  shopId: string;
  activityId: string;
  shopName: string;
  shopDescription?: string;
  stylePreset?: StylePreset;
  locale?: string;
}): Promise<GenerateThemeResponse> {
  return await backendPost<GenerateThemeResponse>('/api/v1/ai/builder/generate-theme', params);
}

export interface GeneratePagesResponse {
  pages: Record<string, PageSchema>;
}

export async function aiGeneratePages(params: {
  shopId: string;
  activityId: string;
  shopName: string;
  shopDescription?: string;
  locale?: string;
  pages?: string[];
}): Promise<GeneratePagesResponse> {
  return await backendPost<GeneratePagesResponse>('/api/v1/ai/builder/generate-pages', params);
}

export async function aiGenerateBrand(params: {
  shopId: string;
  activityId: string;
  shopName: string;
  shopDescription?: string;
  locale?: string;
}): Promise<Partial<BrandIdentity>> {
  return await backendPost<Partial<BrandIdentity>>('/api/v1/ai/builder/generate-brand', params);
}

export interface BuilderChatResponse {
  reply: string;
  designTokens?: Partial<DesignTokens>;
  pageSchema?: Partial<PageSchema>;
  brandIdentity?: Partial<BrandIdentity>;
  applied: boolean;
}

export async function aiBuilderChat(params: {
  shopId: string;
  message: string;
  context?: {
    currentPage?: string;
    locale?: string;
    activityId?: string;
    selectedSectionId?: string;
  };
}): Promise<BuilderChatResponse> {
  return await backendPost<BuilderChatResponse>('/api/v1/ai/builder/chat', params);
}

// ─── AI Visual Editor: Element-specific changes ───────────────

export interface VisualEditResponse {
  reply: string;
  change: {
    component: string;
    changes: Record<string, any>;
    contentChanges?: Record<string, string>;
  } | null;
  applied: boolean;
}

export async function aiVisualEdit(params: {
  shopId: string;
  componentName: string;
  elementInspection: any;
  userPrompt: string;
  locale?: string;
}): Promise<VisualEditResponse> {
  return await backendPost<VisualEditResponse>('/api/v1/ai/builder/visual-edit', params);
}

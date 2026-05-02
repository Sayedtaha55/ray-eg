import { backendPost } from '../httpClient';

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

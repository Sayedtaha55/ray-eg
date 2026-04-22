/**
 * Provider-agnostic AI interface — swap OpenAI, Anthropic, Gemini, or any
 * future provider without touching business logic.
 */
export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: AiToolCall[];
}

export interface AiToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface AiToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema
}

export interface AiChatRequest {
  messages: AiMessage[];
  tools?: AiToolDefinition[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AiChatResponse {
  content: string;
  toolCalls?: AiToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AiStreamChunk {
  delta: string;
  toolCalls?: Partial<AiToolCall>[];
  finishReason?: string;
}

export interface AiProvider {
  readonly name: string;

  chat(request: AiChatRequest): Promise<AiChatResponse>;

  chatStream(
    request: AiChatRequest,
    onChunk: (chunk: AiStreamChunk) => void,
  ): Promise<AiChatResponse>;

  estimateCost(usage: { promptTokens: number; completionTokens: number }): number;
}

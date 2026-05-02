import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiChatRequest,
  AiChatResponse,
  AiStreamChunk,
  AiToolCall,
} from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY', '');
    this.baseUrl = this.config.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4.1-mini');
  }

  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    const body = this.buildRequestBody(request, false);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`OpenAI error ${response.status}: ${errText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content || '',
      toolCalls: this.mapToolCalls(choice?.message?.tool_calls),
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  }

  async chatStream(
    request: AiChatRequest,
    onChunk: (chunk: AiStreamChunk) => void,
  ): Promise<AiChatResponse> {
    const body = this.buildRequestBody(request, true);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`OpenAI stream error ${response.status}: ${errText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    let fullContent = '';
    const allToolCalls: Map<number, AiToolCall> = new Map();
    let finishReason: string | undefined;
    let usage: any;

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No readable stream');

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            fullContent += delta.content;
            onChunk({ delta: delta.content });
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              const existing = allToolCalls.get(idx) || { id: '', name: '', arguments: {} as any };
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name = tc.function.name;
              if (tc.function?.arguments) {
                try {
                  const parsed = JSON.parse(tc.function.arguments);
                  existing.arguments = { ...existing.arguments, ...parsed };
                } catch {
                  // partial JSON — accumulate string
                }
              }
              allToolCalls.set(idx, existing);
            }
            onChunk({ delta: '', toolCalls: delta.tool_calls });
          }

          if (json.choices?.[0]?.finish_reason) {
            finishReason = json.choices[0].finish_reason;
          }
          if (json.usage) usage = json.usage;
        } catch {
          // skip malformed chunks
        }
      }
    }

    return {
      content: fullContent,
      toolCalls: allToolCalls.size > 0 ? Array.from(allToolCalls.values()) : undefined,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
      finishReason,
    };
  }

  estimateCost(usage: { promptTokens: number; completionTokens: number }): number {
    // GPT-4.1-mini pricing: $0.40/1M input, $1.60/1M output
    const inputCost = (usage.promptTokens / 1_000_000) * 0.4;
    const outputCost = (usage.completionTokens / 1_000_000) * 1.6;
    return inputCost + outputCost;
  }

  private buildRequestBody(request: AiChatRequest, stream: boolean) {
    const body: any = {
      model: this.model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
        ...(m.toolCalls
          ? {
              tool_calls: m.toolCalls.map((tc) => ({
                id: tc.id,
                type: 'function',
                function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
              })),
            }
          : {}),
      })),
      max_tokens: request.maxTokens || 2048,
      temperature: request.temperature ?? 0.3,
      stream,
    };

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    return body;
  }

  private mapToolCalls(raw: any[]): AiToolCall[] | undefined {
    if (!raw || raw.length === 0) return undefined;
    return raw.map((tc) => ({
      id: tc.id,
      name: tc.function?.name,
      arguments: typeof tc.function?.arguments === 'string'
        ? JSON.parse(tc.function.arguments)
        : tc.function?.arguments || {},
    }));
  }
}

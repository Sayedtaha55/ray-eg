import { AiProvider, AiChatRequest, AiChatResponse, AiToolCall } from './ai-provider.interface';

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: GroqToolCall[];
}

interface GroqToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface GroqChoice {
  index: number;
  message: GroqMessage;
  finish_reason: string;
}

interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage: GroqUsage;
}

export class GroqProvider implements AiProvider {
  name = 'Groq';
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'llama-3.1-70b-versatile';
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }

  async chat(request: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools: request.tools?.map((tool: any) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data: GroqResponse = await response.json();
    const choice = data.choices[0];
    
    if (!choice) {
      throw new Error('No choice returned from Groq API');
    }

    const toolCalls: any[] = choice.message.tool_calls?.map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })) || [];

    return {
      content: choice.message.content || '',
      toolCalls,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async chatStream(request: any, onChunk: (chunk: any) => void): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools: request.tools?.map((tool: any) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                onChunk({ delta });
              }
            } catch {
              // Ignore malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  estimateCost(usage: { promptTokens: number; completionTokens: number }): number {
    // Groq pricing (as of 2024)
    const pricing = {
      'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 }, // per 1M tokens
      'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
      'mixtral-8x7b-32768': { input: 0.27, output: 0.27 },
    };

    const modelPricing = pricing[this.model as keyof typeof pricing];
    if (!modelPricing) return 0;

    return ((usage.promptTokens * modelPricing.input) + (usage.completionTokens * modelPricing.output)) / 1_000_000;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  AiProvider,
  AiProviderResponse,
  ChatMessage,
} from './ai-provider.interface';
import { ErrorNormalizer } from '../errors/error-normalizer';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;

    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    this.logger.log(`[OpenRouterProvider] Initialized with model: ${this.model}`);
  }

  async generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal },
  ): Promise<AiProviderResponse<T>> {
    const startTime = Date.now();
    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentPrompt =
          attempt > 1
            ? `${prompt}\n\nIMPORTANT: Your previous response was invalid JSON. Return ONLY the raw JSON object. No markdown fences.`
            : prompt;

        const fetchOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', // OpenRouter requirement
            'X-Title': 'VentureForge AI',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are a precise JSON generator. Return ONLY valid JSON objects. No markdown fences, no explanation text.',
              },
              { role: 'user', content: currentPrompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: options?.maxTokens || 8192,
            temperature: options?.temperature ?? 0.7,
          }),
        };

        let timeoutId: NodeJS.Timeout | undefined;
        if (options?.timeoutMs || options?.signal) {
          const controller = new AbortController();
          fetchOptions.signal = controller.signal;

          if (options?.signal) options.signal.addEventListener('abort', () => controller.abort());
          if (options?.timeoutMs) timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), options.timeoutMs);
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw Object.assign(new Error(`OpenRouter API error (${response.status}): ${errorText}`), { status: response.status });
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';

        let jsonStr = rawText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || jsonStr.match(/\{[\s\S]*\}/);
        jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || jsonStr;

        const parsed = JSON.parse(jsonStr);
        const validated = schema.parse(parsed);

        const durationMs = Date.now() - startTime;
        const usage = {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        };

        this.logger.debug(
          `[OpenRouterProvider] JSON SUCCESS (attempt ${attempt}/${maxAttempts}). ` +
            `Model: ${this.model}. Duration: ${durationMs}ms. Tokens: ${usage.totalTokens}`,
        );

        return { data: validated, usage, model: this.model, durationMs };
      } catch (err) {
        lastError = err as Error;
        const normalized = ErrorNormalizer.normalize(err, 'OpenRouter', 'Structured JSON');
        
        if (normalized.errorType === 'INVALID_KEY' || normalized.errorType === 'CREDIT_EXHAUSTED') {
           throw normalized;
        }

        this.logger.warn(
          `[OpenRouterProvider] JSON attempt ${attempt}/${maxAttempts} failed: ${normalized.message}`,
        );

        if (attempt < maxAttempts) {
          const delay = (normalized.retryAfter * 1000) || (Math.pow(2, attempt) * 500);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    throw ErrorNormalizer.normalize(lastError, 'OpenRouter', 'Structured JSON');
  }

  async generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();
    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'VentureForge AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        }),
      };

      let timeoutId: NodeJS.Timeout | undefined;
      if (options?.timeoutMs || options?.signal) {
        const controller = new AbortController();
        fetchOptions.signal = controller.signal;
        if (options?.signal) options.signal.addEventListener('abort', () => controller.abort());
        if (options?.timeoutMs) timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), options.timeoutMs);
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw Object.assign(new Error(`OpenRouter API error (${response.status}): ${errorText}`), { status: response.status });
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';
      text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      throw ErrorNormalizer.normalize(err, 'OpenRouter', 'Text Generation');
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();
    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'VentureForge AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        }),
      };

      let timeoutId: NodeJS.Timeout | undefined;
      if (options?.timeoutMs || options?.signal) {
        const controller = new AbortController();
        fetchOptions.signal = controller.signal;
        if (options?.signal) options.signal.addEventListener('abort', () => controller.abort());
        if (options?.timeoutMs) timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), options.timeoutMs);
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw Object.assign(new Error(`OpenRouter API error (${response.status}): ${errorText}`), { status: response.status });
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';
      text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      throw ErrorNormalizer.normalize(err, 'OpenRouter', 'Chat');
    }
  }
}

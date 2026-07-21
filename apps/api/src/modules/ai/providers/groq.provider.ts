import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  AiProvider,
  AiProviderResponse,
  ChatMessage,
} from './ai-provider.interface';

/**
 * GroqProvider — OpenAI-compatible provider for Groq-hosted models.
 *
 * Supports DeepSeek, Qwen, Llama, and other models available on Groq's
 * ultra-fast inference platform. Uses the OpenAI-compatible chat/completions
 * endpoint with JSON mode for structured output.
 *
 * Features:
 * - Configurable model via constructor injection
 * - Structured JSON mode with Zod validation
 * - Automatic retry with exponential backoff
 * - Token usage tracking
 * - Automatic fallback model support
 */
@Injectable()
export class GroqProvider implements AiProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;

    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    this.logger.log(`[GroqProvider] Initialized with model: ${this.model}`);
  }

  /**
   * Generate a structured JSON response validated against a Zod schema.
   * Uses Groq's OpenAI-compatible JSON mode.
   */
  async generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<T>> {
    const startTime = Date.now();
    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentPrompt =
          attempt > 1
            ? `${prompt}\n\nIMPORTANT: Your previous response was invalid JSON or did not match the required schema. Return ONLY the raw JSON object. No markdown fences, no explanation text, no thinking process. Strictly follow the requested structure.`
            : prompt;

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are a precise JSON generator. Return ONLY valid JSON objects. No markdown fences, no explanation text, no thinking process. Only output the JSON object.',
              },
              { role: 'user', content: currentPrompt },
            ],
            max_tokens: options?.maxTokens || 8192,
            temperature: options?.temperature ?? 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';

        // Parse JSON — handle potential markdown fences from reasoning models
        let jsonStr = rawText;

        // Strip thinking tags that DeepSeek/Qwen reasoning models sometimes emit
        jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        // Handle markdown code fences
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
          `[GroqProvider] JSON generation SUCCESS (attempt ${attempt}/${maxAttempts}). ` +
            `Model: ${this.model}. Duration: ${durationMs}ms. Tokens: ${usage.totalTokens}`,
        );

        return { data: validated, usage, model: this.model, durationMs };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `[GroqProvider] JSON generation attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`,
        );

        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    throw new Error(
      `[GroqProvider] All ${maxAttempts} JSON generation attempts failed. Model: ${this.model}. Last error: ${lastError?.message}`,
    );
  }

  /**
   * Generate free-form text (summaries, explanations, narratives).
   */
  async generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';

      // Strip thinking tags from reasoning models
      text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      this.logger.debug(
        `[GroqProvider] Text generation SUCCESS. Model: ${this.model}. Duration: ${durationMs}ms. Tokens: ${usage.totalTokens}`,
      );

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      this.logger.error(`[GroqProvider] Text generation failed: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Multi-turn chat conversation.
   */
  async chat(
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();

    try {
      const groqMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: groqMessages,
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || '';

      // Strip thinking tags from reasoning models
      text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      };

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      this.logger.error(`[GroqProvider] Chat failed: ${(err as Error).message}`);
      throw err;
    }
  }
}

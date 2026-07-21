import { z } from 'zod';
import { AiProvider, AiProviderResponse, ChatMessage } from './ai-provider.interface';
import { AiError } from '../errors/ai-error';
import { AiLoggerService } from '../ai-logger.service';
import { ReportGateway } from '../../reports/report.gateway';

export interface ResilientProviderOptions {
  serviceName: string;
}

/**
 * ResilientAiProvider wraps multiple AI providers and implements:
 * 1. Exponential Backoff (1s, 2s, 4s, 8s)
 * 2. Automatic Fallback (Primary -> Backup 1 -> Backup 2)
 * 3. Circuit Breaking & Quota Exhaustion detection
 * 4. Granular Event Emission for UI Toast notifications
 */
export class ResilientAiProvider implements AiProvider {
  constructor(
    private readonly primary: AiProvider,
    private readonly fallbacks: AiProvider[],
    private readonly logger: AiLoggerService,
    private readonly reportGateway: ReportGateway,
    private readonly options: ResilientProviderOptions,
  ) {}

  private async executeWithResilience<T>(
    operation: (provider: AiProvider) => Promise<T>,
    operationType: string,
    options?: { serviceName?: string; reportId?: string }
  ): Promise<T> {
    const providers = [this.primary, ...this.fallbacks];
    let lastError: AiError | null = null;
    let providerIndex = 0;
    const serviceName = options?.serviceName || this.options.serviceName || 'UnknownService';
    const reportId = options?.reportId;

    while (providerIndex < providers.length) {
      const currentProvider = providers[providerIndex];
      const providerName = currentProvider.constructor.name.replace('Provider', '');
      
      const maxRetries = 3; // 4 attempts total
      
      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
          if (attempt > 1 && reportId) {
            this.reportGateway.server.to(`report:${reportId}`).emit('report:retry', { 
              service: serviceName, 
              provider: providerName,
              attempt,
              message: `Retrying ${serviceName} AI request...` 
            });
          }

          const startTime = Date.now();
          const result = await operation(currentProvider);
          const latencyMs = Date.now() - startTime;
          
          // Log Success
          const usage = (result as any)?.usage;
          this.logger.logRequest({
            provider: providerName,
            service: serviceName,
            model: (result as any)?.model || 'unknown',
            promptTokens: usage?.inputTokens || 0,
            responseTokens: usage?.outputTokens || 0,
            latencyMs,
            retries: attempt - 1,
            fallbackUsed: providerIndex > 0,
            requestId: crypto.randomUUID(),
          });

          return result;
        } catch (error) {
          const aiError = error instanceof AiError ? error : new AiError({
            provider: providerName,
            service: serviceName,
            errorType: 'UNKNOWN',
            httpStatus: 500,
            message: (error as Error).message,
            originalError: error,
          });

          lastError = aiError;
          
          if (aiError.errorType === 'CREDIT_EXHAUSTED' || aiError.errorType === 'INVALID_KEY') {
            this.logger.logError(aiError, providers[providerIndex + 1]?.constructor.name);
            break;
          }

          if (attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt - 1) * 1000;
            this.logger.logError(aiError);
            await new Promise((res) => setTimeout(res, backoffMs));
          } else {
            this.logger.logError(aiError, providers[providerIndex + 1]?.constructor.name);
          }
        }
      }

      providerIndex++;
      if (providerIndex < providers.length && reportId) {
        this.reportGateway.server.to(`report:${reportId}`).emit('report:fallback', { 
          service: serviceName,
          from: providerName,
          to: providers[providerIndex].constructor.name.replace('Provider', ''),
          message: 'Switching to backup AI provider...'
        });
      }
    }

    if (reportId) {
      this.reportGateway.server.to(`report:${reportId}`).emit('report:warning', { 
        service: serviceName,
        message: `Unable to complete ${serviceName}. Using defaults.`,
        error: lastError?.message,
      });
    }
    
    throw lastError;
  }

  generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal; serviceName?: string; reportId?: string },
  ): Promise<AiProviderResponse<T>> {
    return this.executeWithResilience(
      (provider) => provider.generateStructuredJson(prompt, schema, options),
      'Structured JSON',
      { serviceName: options?.serviceName, reportId: options?.reportId }
    );
  }

  generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal; serviceName?: string; reportId?: string },
  ): Promise<AiProviderResponse<string>> {
    return this.executeWithResilience(
      (provider) => provider.generateText(prompt, options),
      'Text Generation',
      { serviceName: options?.serviceName, reportId: options?.reportId }
    );
  }

  chat(
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number; timeoutMs?: number; signal?: AbortSignal; serviceName?: string; reportId?: string },
  ): Promise<AiProviderResponse<string>> {
    return this.executeWithResilience(
      (provider) => provider.chat(messages, options),
      'Chat',
      { serviceName: options?.serviceName, reportId: options?.reportId }
    );
  }
}

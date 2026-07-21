import { Injectable, Logger } from '@nestjs/common';
import { AiError } from './errors/ai-error';

export interface AiRequestLogParams {
  provider: string;
  service: string;
  model: string;
  promptTokens: number;
  responseTokens: number;
  latencyMs: number;
  retries: number;
  fallbackUsed: boolean;
  requestId: string;
}

@Injectable()
export class AiLoggerService {
  private readonly nestLogger = new Logger('AiPlatform');
  
  // Use development mode colors only if we are in dev environment.
  // We can check process.env.NODE_ENV, but for simplicity, we'll log colored output to console in dev
  // and use the standard NestJS logger for production (which might go to CloudWatch/Loki).
  private isDevelopment = process.env.NODE_ENV !== 'production';

  logRequest(params: AiRequestLogParams) {
    const costEstimate = params.provider.toLowerCase().includes('groq') ? 'Free Tier' : 'Standard Pricing';

    if (this.isDevelopment) {
      console.log('\n\x1b[36m%s\x1b[0m', '=====================================');
      console.log('\x1b[36m%s\x1b[0m', '🤖 AI REQUEST');
      console.log('\x1b[36m%s\x1b[0m', '=====================================');
      console.log(`Provider:      \x1b[32m${params.provider}\x1b[0m`);
      console.log(`Service:       ${params.service}`);
      console.log(`Model:         \x1b[33m${params.model}\x1b[0m`);
      console.log(`Prompt Tokens: ${params.promptTokens}`);
      console.log(`Response Tokens:${params.responseTokens}`);
      console.log(`Latency:       \x1b[35m${(params.latencyMs / 1000).toFixed(2)} sec\x1b[0m`);
      console.log(`Retries:       ${params.retries}`);
      console.log(`Fallback Used: ${params.fallbackUsed ? '\x1b[31mYes\x1b[0m' : '\x1b[32mNo\x1b[0m'}`);
      console.log(`Cost Estimate: ${costEstimate}`);
      console.log(`Request ID:    ${params.requestId}`);
      console.log('\x1b[36m%s\x1b[0m', '=====================================\n');
    } else {
      this.nestLogger.log(
        JSON.stringify({
          type: 'AI_REQUEST',
          ...params,
          costEstimate,
        })
      );
    }
  }

  logError(error: AiError, switchingToProvider?: string) {
    if (this.isDevelopment) {
      console.log('\n\x1b[31m%s\x1b[0m', '=====================================');
      console.log('\x1b[31m%s\x1b[0m', '🚨 AI ERROR');
      console.log('\x1b[31m%s\x1b[0m', '=====================================');
      console.log(`Provider:           \x1b[33m${error.provider}\x1b[0m`);
      console.log(`Service:            ${error.service}`);
      console.log(`HTTP Status:        \x1b[31m${error.httpStatus}\x1b[0m`);
      console.log(`Error Code:         \x1b[31m${error.errorType}\x1b[0m`);
      console.log(`Message:            ${error.message}`);
      if (error.retryAfter > 0) {
        console.log(`Retry After:        ${error.retryAfter} sec`);
      }
      console.log(`Fallback Available: ${error.fallbackAvailable ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m'}`);
      if (switchingToProvider) {
        console.log(`Switching Provider: \x1b[35m${switchingToProvider}\x1b[0m`);
      }
      console.log(`Request ID:         ${error.requestId}`);
      console.log('\x1b[31m%s\x1b[0m', '=====================================\n');
    } else {
      this.nestLogger.error(
        JSON.stringify({
          type: 'AI_ERROR',
          provider: error.provider,
          service: error.service,
          errorType: error.errorType,
          httpStatus: error.httpStatus,
          message: error.message,
          retryAfter: error.retryAfter,
          fallbackAvailable: error.fallbackAvailable,
          switchingToProvider,
          requestId: error.requestId,
        }),
        error.originalError?.stack,
      );
    }
  }

  logInfo(message: string, meta?: any) {
    if (this.isDevelopment) {
      console.log('\x1b[34m[AI Platform]\x1b[0m', message, meta || '');
    } else {
      this.nestLogger.log(JSON.stringify({ message, meta }));
    }
  }

  logWarn(message: string, meta?: any) {
    if (this.isDevelopment) {
      console.warn('\x1b[33m[AI Platform WARNING]\x1b[0m', message, meta || '');
    } else {
      this.nestLogger.warn(JSON.stringify({ message, meta }));
    }
  }
}

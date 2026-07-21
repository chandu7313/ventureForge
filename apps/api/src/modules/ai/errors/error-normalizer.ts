import { AiError, AiErrorType } from './ai-error';

export class ErrorNormalizer {
  static normalize(error: any, provider: string, service: string): AiError {
    // If it's already an AiError, just return it
    if (error instanceof AiError) {
      return error;
    }

    const message = error?.message || 'Unknown AI Provider Error';
    const status = error?.status || error?.response?.status || 500;
    const errorText = JSON.stringify(error).toLowerCase() + message.toLowerCase();

    let errorType: AiErrorType = 'UNKNOWN';
    let httpStatus = status;
    let retryAfter = 0;
    let fallbackAvailable = true;

    // 1. Rate Limit / Resource Exhausted
    if (
      status === 429 ||
      errorText.includes('rate limit') ||
      errorText.includes('resource exhausted') ||
      errorText.includes('too many requests')
    ) {
      errorType = 'RATE_LIMIT';
      httpStatus = 429;
      retryAfter = this.extractRetryAfter(error) || 60; // Default to 60s if missing
    }
    // 2. Credit Exhausted / Quota
    else if (
      status === 402 ||
      errorText.includes('quota exceeded') ||
      errorText.includes('insufficient_quota') ||
      errorText.includes('credits exhausted') ||
      errorText.includes('out of credits')
    ) {
      errorType = 'CREDIT_EXHAUSTED';
      httpStatus = 402;
      fallbackAvailable = true; // High priority to fallback
    }
    // 3. Invalid API Key / Auth
    else if (
      status === 401 ||
      status === 403 ||
      errorText.includes('invalid api key') ||
      errorText.includes('authentication failed') ||
      errorText.includes('unauthorized')
    ) {
      errorType = 'INVALID_KEY';
      httpStatus = status;
      fallbackAvailable = true; // API key is busted, try fallback immediately
    }
    // 4. Timeout
    else if (
      status === 408 ||
      status === 504 ||
      errorText.includes('timeout') ||
      errorText.includes('abort') ||
      error?.name === 'AbortError'
    ) {
      errorType = 'TIMEOUT';
      httpStatus = status === 200 ? 504 : status;
      retryAfter = 2; // Short retry for timeouts
    }
    // 5. Network / Offline
    else if (
      errorText.includes('network error') ||
      errorText.includes('econnrefused') ||
      errorText.includes('enotfound') ||
      errorText.includes('fetch failed')
    ) {
      errorType = 'NETWORK';
      retryAfter = 5;
    }
    // 6. JSON Parse Error (Not an API error, but generation error)
    else if (
      errorText.includes('json') && 
      (errorText.includes('parse') || errorText.includes('syntax'))
    ) {
      errorType = 'PARSE';
      httpStatus = 422;
      retryAfter = 1;
    }
    // 7. Provider Offline / 500s
    else if (status >= 500) {
      errorType = 'OFFLINE';
    }

    return new AiError({
      provider,
      service,
      errorType,
      httpStatus,
      message,
      retryAfter,
      fallbackAvailable,
      originalError: error,
    });
  }

  private static extractRetryAfter(error: any): number | undefined {
    // Attempt to parse standard Retry-After headers if available in standard Axios/Fetch response errors
    const retryAfterHeader = error?.response?.headers?.['retry-after'] || error?.headers?.get?.('retry-after');
    if (retryAfterHeader) {
      const parsed = parseInt(retryAfterHeader, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return undefined;
  }
}

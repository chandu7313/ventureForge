export type AiErrorType = 
  | 'RATE_LIMIT'
  | 'CREDIT_EXHAUSTED'
  | 'INVALID_KEY'
  | 'OFFLINE'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'PARSE'
  | 'UNKNOWN';

export interface AiErrorOptions {
  provider: string;
  service: string;
  errorType: AiErrorType;
  httpStatus: number;
  message: string;
  retryAfter?: number;
  fallbackAvailable?: boolean;
  requestId?: string;
  originalError?: any;
}

export class AiError extends Error {
  public readonly success = false;
  public readonly provider: string;
  public readonly service: string;
  public readonly errorType: AiErrorType;
  public readonly httpStatus: number;
  public readonly retryAfter: number;
  public readonly fallbackAvailable: boolean;
  public readonly requestId: string;
  public readonly timestamp: string;
  public readonly originalError: any;

  constructor(options: AiErrorOptions) {
    super(options.message);
    this.name = 'AiError';
    
    this.provider = options.provider;
    this.service = options.service;
    this.errorType = options.errorType;
    this.httpStatus = options.httpStatus;
    this.retryAfter = options.retryAfter || 0;
    this.fallbackAvailable = options.fallbackAvailable ?? true;
    this.requestId = options.requestId || crypto.randomUUID();
    this.timestamp = new Date().toISOString();
    this.originalError = options.originalError || null;
  }
}

import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiOrchestrator } from './ai.orchestrator';

// Providers
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ResilientAiProvider } from './providers/resilient-ai.provider';
import { TavilyProvider } from './providers/tavily.provider';
import { AiLoggerService } from './ai-logger.service';
import { ReportGateway } from '../reports/report.gateway';

// Calculators & Generators
import { FinancialCalculatorService } from './calculators/financial-calculator.service';
import { DiagramGeneratorService } from './generators/diagram-generator.service';

// Agents
import { MarketAgent } from './agents/market.agent';
import { CompetitorAgent } from './agents/competitor.agent';
import { ProductAgent } from './agents/product.agent';
import { VcAgent } from './agents/vc.agent';
import { BusinessFormationAgent } from './agents/business-formation.agent';
import { ComplianceAgent } from './agents/compliance.agent';
import { FinancialAgent } from './agents/financial.agent';
import { OperationsAgent } from './agents/operations.agent';

import { ReportsModule } from '../reports/reports.module';

// ── Injection Tokens ─────────────────────────────────────────
export const GEMINI_PRO = 'GEMINI_PRO';
export const GEMINI_FLASH = 'GEMINI_FLASH';
export const GROQ_DEEPSEEK = 'GROQ_DEEPSEEK';
export const GROQ_QWEN = 'GROQ_QWEN';

@Module({
  imports: [ConfigModule, forwardRef(() => ReportsModule)],
  providers: [
    AiOrchestrator,

    AiLoggerService,
    
    // ── LLM Providers (Task-Based Routing with Resilience) ─────

    // Gemini 2.5 Pro — Business reasoning, synthesis, long reports
    {
      provide: GEMINI_PRO,
      useFactory: (config: ConfigService, logger: AiLoggerService, gateway: ReportGateway) => {
        const primary = new GeminiProvider(config.get('GEMINI_API_KEY')!, config.get('GEMINI_PRO_MODEL') || 'gemini-2.5-pro');
        const fallback1 = new OpenRouterProvider(config.get('OPENROUTER_API_KEY') || 'mock', 'google/gemini-2.5-pro');
        const fallback2 = new GroqProvider(config.get('GROQ_API_KEY')!, 'llama-3.3-70b-versatile'); // Groq fallback for Pro reasoning
        return new ResilientAiProvider(primary, [fallback1, fallback2], logger, gateway, { serviceName: 'Pro AI' });
      },
      inject: [ConfigService, AiLoggerService, ReportGateway],
    },

    // Gemini 2.5 Flash — Fast chat, diagrams, quick scoring
    {
      provide: GEMINI_FLASH,
      useFactory: (config: ConfigService, logger: AiLoggerService, gateway: ReportGateway) => {
        const primary = new GeminiProvider(config.get('GEMINI_API_KEY')!, config.get('GEMINI_FLASH_MODEL') || 'gemini-2.5-flash');
        const fallback1 = new OpenRouterProvider(config.get('OPENROUTER_API_KEY') || 'mock', 'google/gemini-2.5-flash');
        const fallback2 = new GroqProvider(config.get('GROQ_API_KEY')!, 'llama3-8b-8192'); // Fast fallback
        return new ResilientAiProvider(primary, [fallback1, fallback2], logger, gateway, { serviceName: 'Fast AI' });
      },
      inject: [ConfigService, AiLoggerService, ReportGateway],
    },

    // Groq DeepSeek — Financial analytical reasoning (free via Groq)
    {
      provide: GROQ_DEEPSEEK,
      useFactory: (config: ConfigService, logger: AiLoggerService, gateway: ReportGateway) => {
        const primary = new GroqProvider(config.get('GROQ_API_KEY')!, config.get('GROQ_DEEPSEEK_MODEL') || 'deepseek-r1-distill-qwen-32b');
        const fallback1 = new OpenRouterProvider(config.get('OPENROUTER_API_KEY') || 'mock', 'deepseek/deepseek-r1');
        const fallback2 = new GeminiProvider(config.get('GEMINI_API_KEY')!, 'gemini-2.5-pro');
        return new ResilientAiProvider(primary, [fallback1, fallback2], logger, gateway, { serviceName: 'Financial AI' });
      },
      inject: [ConfigService, AiLoggerService, ReportGateway],
    },

    // Groq Qwen — Structured JSON generation (free via Groq)
    {
      provide: GROQ_QWEN,
      useFactory: (config: ConfigService, logger: AiLoggerService, gateway: ReportGateway) => {
        const primary = new GroqProvider(config.get('GROQ_API_KEY')!, config.get('GROQ_QWEN_MODEL') || 'qwen-qwq-32b');
        const fallback1 = new OpenRouterProvider(config.get('OPENROUTER_API_KEY') || 'mock', 'qwen/qwen-2.5-72b-instruct');
        const fallback2 = new GeminiProvider(config.get('GEMINI_API_KEY')!, 'gemini-2.5-flash');
        return new ResilientAiProvider(primary, [fallback1, fallback2], logger, gateway, { serviceName: 'Structure AI' });
      },
      inject: [ConfigService, AiLoggerService, ReportGateway],
    },

    // ── Search Provider ────────────────────────────────────────
    TavilyProvider,

    // ── Calculators & Generators ───────────────────────────────
    FinancialCalculatorService,
    DiagramGeneratorService,

    // ── Layer 1 — Validation Intelligence ──────────────────────
    MarketAgent,
    CompetitorAgent,
    ProductAgent,

    // ── Layer 2 — Business Formation Engine ────────────────────
    BusinessFormationAgent,
    ComplianceAgent,
    FinancialAgent,
    OperationsAgent,

    // ── Synthesis ──────────────────────────────────────────────
    VcAgent,
  ],
  exports: [AiOrchestrator, GEMINI_PRO, GEMINI_FLASH, GROQ_DEEPSEEK, GROQ_QWEN],
})
export class AiModule {}

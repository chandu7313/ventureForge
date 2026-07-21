import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiOrchestrator } from './ai.orchestrator';

// Providers
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { TavilyProvider } from './providers/tavily.provider';

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

    // ── LLM Providers (Task-Based Routing) ─────────────────────

    // Gemini 2.5 Pro — Business reasoning, synthesis, long reports
    {
      provide: GEMINI_PRO,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GEMINI_API_KEY');
        const model = config.get<string>('GEMINI_PRO_MODEL') || 'gemini-2.5-pro';
        return new GeminiProvider(apiKey!, model);
      },
      inject: [ConfigService],
    },

    // Gemini 2.5 Flash — Fast chat, diagrams, quick scoring
    {
      provide: GEMINI_FLASH,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GEMINI_API_KEY');
        const model = config.get<string>('GEMINI_FLASH_MODEL') || 'gemini-2.5-flash';
        return new GeminiProvider(apiKey!, model);
      },
      inject: [ConfigService],
    },

    // Groq DeepSeek — Financial analytical reasoning (free via Groq)
    {
      provide: GROQ_DEEPSEEK,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GROQ_API_KEY');
        const model = config.get<string>('GROQ_DEEPSEEK_MODEL') || 'deepseek-r1-distill-qwen-32b';
        return new GroqProvider(apiKey!, model);
      },
      inject: [ConfigService],
    },

    // Groq Qwen — Structured JSON generation (free via Groq)
    {
      provide: GROQ_QWEN,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GROQ_API_KEY');
        const model = config.get<string>('GROQ_QWEN_MODEL') || 'qwen-qwq-32b';
        return new GroqProvider(apiKey!, model);
      },
      inject: [ConfigService],
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

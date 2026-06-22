import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
const whois = require('whois-json');
import * as dns from 'dns';
import { promisify } from 'util';
import { RedisService, CacheKeys } from '../../common/redis/redis.service';

const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

const NameGeneratorSchema = z.object({
  names: z.array(
    z.object({
      name: z.string(),
      tagline: z.string(),
      domain_com: z.string(),
      domain_in: z.string(),
      rationale: z.string(),
    })
  ).length(10),
});

export type GeneratedName = z.infer<typeof NameGeneratorSchema>['names'][0];

@Injectable()
export class NameGeneratorService {
  private readonly logger = new Logger(NameGeneratorService.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateNames(idea: string, industry: string, geo: string): Promise<GeneratedName[]> {
    const prompt = `You are an elite brand strategist and naming expert who has named Y Combinator and Peak XV startups.
Generate EXACTLY 10 highly brandable, catchy startup name ideas for the following concept.

IDEA: ${idea}
INDUSTRY: ${industry}
TARGET GEOGRAPHY: ${geo}

Rules:
1. Names must be 1-2 words max.
2. Must be highly pronounceable and memorable.
3. Culturally appropriate for the geography (e.g. if India, subtle Hindi/Sanskrit influences or suffixes like 'pe', 'karo', 'wala' can work if tasteful, but don't force it. English words are also fine).
4. Do NOT use obvious, boring combinations (e.g. "FarmAI", "HealthTech"). Be abstract or evocative (e.g., "Zepto", "Kred", "Oyo", "Razorpay").
5. The proposed .com and .in domains should be reasonably likely to be available (avoid standard dictionary words without modifiers).

Return ONLY a JSON object with this exact structure, nothing else:
{
  "names": [
    {
      "name": "BrandName",
      "tagline": "Short 3-6 word tagline",
      "domain_com": "brandname.com",
      "domain_in": "brandname.in",
      "rationale": "Why this name works"
    }
  ]
}`;

    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText;

    try {
      const parsed = JSON.parse(jsonStr);
      const validated = NameGeneratorSchema.parse(parsed);
      return validated.names;
    } catch (error) {
      this.logger.error('Failed to parse AI generated names', error);
      throw new Error('Failed to generate valid names. Please try again.');
    }
  }

  async checkDomain(domain: string): Promise<{ available: boolean; price?: string }> {
    const cacheKey = `domain:${domain}`;
    
    // 1. Check Cache
    const cached = await this.redis.get<{ available: boolean }>(cacheKey);
    if (cached) {
      return cached;
    }

    let available = true;

    try {
      // 2. Fast Fail via DNS (if it has an IP, it's definitely taken)
      try {
        await resolve4(domain);
        available = false;
      } catch (err: any) {
        if (err.code !== 'ENOTFOUND' && err.code !== 'ENODATA') {
          // Some other DNS error, might not be safe to assume available
        } else {
           // DNS not found. Still might be registered but inactive. Check WHOIS.
           const whoisData = await whois(domain);
           // whois-json returns an object. If it has creationDate, domainName, or Name Server, it's taken.
           if (
             whoisData.domainName || 
             whoisData.creationDate || 
             whoisData.registrar ||
             (whoisData.status && !whoisData.status.toLowerCase().includes('free') && !whoisData.status.toLowerCase().includes('available'))
           ) {
             available = false;
           }
        }
      }
    } catch (error) {
      this.logger.warn(`Domain check failed for ${domain}: `, error);
      // Fallback to assuming available or unavailable? Assume unavailable if WHOIS fails to be safe.
      available = false; 
    }

    const result = { available };
    
    // 3. Cache for 1 hour (3600 seconds)
    await this.redis.set(cacheKey, result, 3600);

    return result;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private anthropic: Anthropic;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async runMarketAnalysis(ideaDetails: string) {
    // Simulated or actual call
    return {
      marketScore: 85,
      insights: "Strong potential in the specified niche.",
      competitors: [
        { name: 'Competitor A', type: 'Direct', weakness: 'High cost', gapToExploit: 'Price' }
      ]
    };
  }

  async runRiskAssessment(ideaDetails: string, marketData: any) {
    return [
      { category: 'Tech', description: 'Scale issues', severity: 'Medium', mitigation: 'Use serverless' }
    ];
  }

  async runTechLead(ideaDetails: string) {
    return {
      timeline: [
        { title: 'Phase 1', duration: '2 weeks', tasks: ['Setup Repo', 'Auth'] }
      ],
      slides: [
        { title: 'Problem', content: 'Huge problem.' }
      ]
    };
  }
}

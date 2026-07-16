import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdeasService {
  constructor(private prisma: PrismaService) {}

  async createIdea(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const mapIndustry = (ind?: string) => {
      if (!ind) return 'OTHER';
      const clean = ind.toUpperCase().replace(/[\s-]/g, '');
      const valid = ['EDTECH', 'FINTECH', 'AGRITECH', 'HEALTHTECH', 'SAAS', 'D2C', 'ECOMMERCE', 'LOGISTICS', 'HRTECH', 'PROPTECH', 'LEGALTECH', 'CLIMATETECH', 'DEEPTECH', 'CREATOR_ECONOMY', 'OTHER'];
      return valid.includes(clean) ? clean : 'OTHER';
    };

    const mapGeography = (geo?: string) => {
      if (!geo) return 'PAN_INDIA';
      if (geo.toLowerCase().includes('india')) return 'PAN_INDIA';
      if (geo.toLowerCase().includes('south')) return 'SOUTHEAST_ASIA';
      return 'GLOBAL';
    };

    return this.prisma.idea.create({
      data: {
        name: data.name,
        problem: data.description,
        targetUsers: data.targetAudience || 'Unknown',
        industry: mapIndustry(data.industry) as any,
        geography: mapGeography(data.geography) as any,
        stage: data.stage || 'idea',
        teamSize: typeof data.teamSize === 'number' ? data.teamSize : 1,
        budget: data.budget || '< ₹5L',
        primarySkill: data.primarySkill || null,
        state: data.state || null,
        businessType: data.businessType || null,
        userId: user.id,
      },
    });
  }
}

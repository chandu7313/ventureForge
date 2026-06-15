import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get report metrics and usage tracking' })
  async getSummary(@CurrentUser() user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkUserId: user.clerkUserId },
    });
    
    if (!dbUser) return null;

    const totalReports = await this.prisma.report.count({ where: { userId: dbUser.id } });
    const reportsWithScores = await this.prisma.report.findMany({
      where: { userId: dbUser.id, status: 'completed' },
      select: { marketScore: true },
    });

    const avgScore = reportsWithScores.length > 0 
      ? reportsWithScores.reduce((acc, r) => acc + (r.marketScore || 0), 0) / reportsWithScores.length
      : 0;

    return {
      totalReports,
      avgScore: Math.round(avgScore),
      validationsLeft: dbUser.plan === 'FREE' ? Math.max(0, 1 - dbUser.reportsCount) : 'Unlimited',
    };
  }
}

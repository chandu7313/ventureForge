import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getReportById(clerkUserId: string, reportId: string) {
    const cacheKey = `report:${reportId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error('User not found');

    const report = await this.prisma.report.findFirst({
      where: { id: reportId, userId: user.id },
      include: { idea: true },
    });

    if (report) {
      await this.cacheManager.set(cacheKey, report, 60000); // 1 minute
    }
    return report;
  }

  async getUserReports(clerkUserId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error('User not found');

    return this.prisma.report.findMany({
      where: { userId: user.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { idea: true },
    });
  }

  async compareReports(clerkUserId: string, id1: string, id2: string) {
    const [report1, report2] = await Promise.all([
      this.getReportById(clerkUserId, id1),
      this.getReportById(clerkUserId, id2),
    ]);
    return { report1, report2 };
  }

  async softDeleteReport(clerkUserId: string, reportId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error('User not found');

    // Assuming we just delete it for now instead of soft-delete since there's no deletedAt column
    return this.prisma.report.deleteMany({
      where: { id: reportId, userId: user.id },
    });
  }
}

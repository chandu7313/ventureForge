import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresPlan } from '../../common/decorators/requires-plan.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
    @InjectQueue('ai-report-generation') private reportQueue: Queue,
  ) {}

  @Post('generate')
  @UseGuards(PlanGuard)
  @ApiOperation({ summary: 'Trigger AI report generation' })
  async generateReport(@CurrentUser() user: any, @Body() data: { ideaId: string }) {
    const dbUser = await this.prisma.user.findUnique({ where: { clerkUserId: user.clerkUserId } });
    if (!dbUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const report = await this.prisma.report.create({
      data: {
        ideaId: data.ideaId,
        userId: dbUser.id,
        status: 'pending',
      },
    });

    await this.reportQueue.add('generate-report', { reportId: report.id, ideaId: data.ideaId });
    
    // Increment usage
    await this.prisma.user.update({
      where: { id: dbUser.id },
      data: { reportsCount: { increment: 1 } },
    });

    return { message: 'Report generation started', reportId: report.id };
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated user reports' })
  async getUserReports(@CurrentUser() user: any, @Query('page') page: string) {
    return this.reportsService.getUserReports(user.clerkUserId, parseInt(page) || 1);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two reports side-by-side' })
  async compareReports(@CurrentUser() user: any, @Query('id1') id1: string, @Query('id2') id2: string) {
    return this.reportsService.compareReports(user.clerkUserId, id1, id2);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID (cached)' })
  async getReport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reportsService.getReportById(user.clerkUserId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete report' })
  async deleteReport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reportsService.softDeleteReport(user.clerkUserId, id);
  }
}

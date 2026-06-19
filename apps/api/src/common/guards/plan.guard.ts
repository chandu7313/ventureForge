import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.get<string[]>('plan', context.getHandler());
    if (!requiredPlan) return true; // No plan required for this route

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check plan access
    if (requiredPlan.includes('PRO') && user.plan === 'FREE') {
      throw new HttpException('Pro plan required', HttpStatus.PAYMENT_REQUIRED);
    }

    // Check usage limits for AI generation
    if (user.plan === 'FREE' && user.reportsUsed >= user.reportsLimit && user.reportsLimit !== -1) {
      throw new HttpException('Free tier limit reached. Please upgrade to Pro.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}

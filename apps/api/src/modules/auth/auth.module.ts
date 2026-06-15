import { Module } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';

@Module({
  providers: [AuthGuard, PlanGuard],
  exports: [AuthGuard, PlanGuard],
})
export class AuthModule {}

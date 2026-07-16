import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';

@Module({
  providers: [IdeasService],
  controllers: [IdeasController],
})
export class IdeasModule {}

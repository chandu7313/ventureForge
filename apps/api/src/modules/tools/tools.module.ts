import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller';
import { NameGeneratorService } from './name-generator.service';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ToolsController],
  providers: [NameGeneratorService],
  exports: [NameGeneratorService],
})
export class ToolsModule {}

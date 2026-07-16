import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { NameGeneratorService } from './name-generator.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

export class GenerateNamesDto {
  @IsString() @IsNotEmpty() idea: string;
  @IsString() @IsNotEmpty() industry: string;
  @IsString() @IsNotEmpty() geo: string;
}

@ApiTags('Tools')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/tools')
export class ToolsController {
  constructor(private readonly nameGenerator: NameGeneratorService) {}

  @Post('name-generator')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Generate 10 startup names using AI' })
  async generateNames(@Body() dto: GenerateNamesDto) {
    const names = await this.nameGenerator.generateNames(dto.idea, dto.industry, dto.geo);
    return { success: true, data: names };
  }

  @Get('domain-check')
  @ApiOperation({ summary: 'Check domain availability via WHOIS/DNS' })
  async checkDomain(@Query('domain') domain: string) {
    if (!domain) {
      return { success: false, message: 'Domain query parameter is required' };
    }
    const result = await this.nameGenerator.checkDomain(domain);
    return { success: true, data: result };
  }
}

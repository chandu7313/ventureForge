import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString() @IsOptional() name?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile and plan' })
  async getMe(@CurrentUser() userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@CurrentUser() userId: string, @Body() data: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, data);
  }
}

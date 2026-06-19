import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { reports: true, ideas: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}

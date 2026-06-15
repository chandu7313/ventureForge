import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(clerkUserId: string) {
    let user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        _count: {
          select: { reports: true, ideas: true }
        }
      }
    });

    // Lazy initialization if user logs in for the first time
    if (!user) {
      // In a real app, you might sync this via Clerk Webhook instead
      const email = `${clerkUserId}@placeholder.com`; // Fallback
      user = await this.prisma.user.create({
        data: {
          clerkUserId,
          email,
        },
        include: {
          _count: {
            select: { reports: true, ideas: true }
          }
        }
      });
    }

    return user;
  }

  async updateProfile(clerkUserId: string, data: any) {
    return this.prisma.user.update({
      where: { clerkUserId },
      data,
    });
  }
}

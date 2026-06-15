import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      request.user = { clerkUserId: decodedToken.sub };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

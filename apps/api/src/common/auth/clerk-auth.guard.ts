import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { ClerkAuthContext } from '@workspace/schemas';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly authorizedParties: string[] | undefined;

  constructor(private readonly reflector: Reflector) {
    this.authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES?.split(',')
      .map((party) => party.trim())
      .filter(Boolean);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing Clerk session token');
    }

    const verificationOptions = this.buildVerificationOptions();

    try {
      const claims = await verifyToken(token, verificationOptions);

      if (!claims.sub) {
        throw new UnauthorizedException('Clerk token is missing a subject');
      }

      const sessionId = this.extractSessionId(claims);

      const auth: ClerkAuthContext = {
        userId: claims.sub,
        sessionId,
        token,
        claims,
      };

      request.auth = auth;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Clerk token', {
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers['authorization'];

    if (!header || Array.isArray(header)) {
      return null;
    }

    const [type, token] = header.split(' ');
    if (type?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  private buildVerificationOptions() {
    const jwtKey = process.env.CLERK_JWT_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!jwtKey && !secretKey) {
      throw new UnauthorizedException(
        'Clerk verification keys are not configured',
      );
    }

    return {
      jwtKey,
      secretKey,
      authorizedParties: this.authorizedParties,
    };
  }

  private extractSessionId(claims: Record<string, unknown>): string | null {
    const value = claims['sid'];
    return typeof value === 'string' ? value : null;
  }
}

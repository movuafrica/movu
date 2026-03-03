import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ClerkAuthContext } from '@workspace/schemas';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkAuthContext | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
  },
);

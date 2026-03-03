import type { ClerkAuthContext } from '@workspace/schemas';

declare global {
  namespace Express {
    interface Request {
      auth?: ClerkAuthContext;
    }
  }
}

export { };

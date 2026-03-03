export type ClerkJwtClaims = Record<string, unknown> & {
  sub?: string;
  sid?: string | null;
};

export interface ClerkAuthContext {
  userId: string;
  sessionId?: string | null;
  token: string;
  claims: ClerkJwtClaims;
}

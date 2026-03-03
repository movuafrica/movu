import { auth } from '@clerk/nextjs/server';
import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './api-types.generated';

const DEFAULT_API_BASE_URL = 'http://localhost:3001';

const getBaseUrl = () =>
  (
    process.env.MOVU_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, '');

/**
 * Unauthenticated typed client — useful for public endpoints or when you
 * supply the Authorization header yourself.
 */
export const apiClient = createClient<paths>({ baseUrl: getBaseUrl() });

/**
 * Returns a typed client pre-configured with the current user's Clerk session
 * token. Must be called from a Server Component, Server Action, or Route Handler.
 */
export async function getAuthenticatedClient() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error('A signed-in user is required to call the API.');
  }

  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
  };

  const client = createClient<paths>({ baseUrl: getBaseUrl() });
  client.use(authMiddleware);
  return client;
}

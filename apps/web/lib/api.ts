import { auth } from '@clerk/nextjs/server';

const DEFAULT_API_BASE_URL = 'http://localhost:3001';

const getApiBaseUrl = () => {
  return (
    process.env.MOVU_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, '');
};

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${getApiBaseUrl()}/${normalizedPath}`;
};

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  { skipAuth = false, ...init }: ApiFetchOptions = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers);

  if (!skipAuth && !headers.has('authorization')) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      throw new Error('A signed-in user is required to call the API.');
    }

    headers.set('authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    throw new Error(
      `API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

const safeJson = async (response: Response) => {
  try {
    return await response.clone().json();
  } catch {
    return response.statusText;
  }
};

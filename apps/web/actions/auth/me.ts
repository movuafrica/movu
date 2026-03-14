'use server';

import { getAuthenticatedClient } from '@/lib/api-client';

export default async function me() {
  const client = await getAuthenticatedClient();
  const { data: account } = await client.GET('/accounts/me');
  return account;
}
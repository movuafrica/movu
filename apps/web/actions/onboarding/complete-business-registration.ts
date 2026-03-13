'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { RegisterBusiness } from '@workspace/schemas';

const getApiBaseUrl = () =>
  (process.env.MOVU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(
    /\/$/,
    '',
  );

type RegistrationState = {
  error?: string;
  success?: boolean;
};

export async function completeBusinessRegistration(
  _prevState: RegistrationState | null,
  formData: FormData,
): Promise<RegistrationState> {
  const { getToken, userId } = await auth();

  if (!userId) {
    return { error: 'You must be signed in to register a business.' };
  }

  const token = await getToken();
  if (!token) {
    return { error: 'Could not retrieve authentication token.' };
  }

  const payload: RegisterBusiness = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phoneNumber: formData.get('phoneNumber') as string,
    country: formData.get('country') as string,
    businessName: formData.get('businessName') as string,
    businessRegistrationNumber: formData.get('businessRegistrationNumber') as string,
    taxId: formData.get('taxId') as string,
    address: formData.get('address') as string,
    postalCode: formData.get('postalCode') as string,
    city: formData.get('city') as string,
    tradeRole: formData.get('tradeRole') as RegisterBusiness['tradeRole'],
  };

  const requiredFields = Object.entries(payload) as [string, string][];
  const missing = requiredFields.filter(([, value]) => !value?.trim());
  if (missing.length > 0) {
    return { error: 'Please complete all required fields before submitting.' };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/accounts/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      return { error: body.message ?? 'Registration failed. Please try again.' };
    }
  } catch {
    return { error: 'Could not connect to the server. Please try again.' };
  }

  redirect('/');
}

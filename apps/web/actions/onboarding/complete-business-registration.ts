'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { RegisterBusiness } from '@workspace/schemas';

const getApiBaseUrl = () =>
  (process.env.MOVU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(
    /\/$/,
    '',
  );

const FIELD_META: Record<keyof RegisterBusiness, { label: string; step: number }> = {
  fullName:                   { label: 'Full Name',                      step: 1 },
  email:                      { label: 'Email',                          step: 1 },
  phoneNumber:                { label: 'Phone Number',                   step: 1 },
  country:                    { label: 'Business Location',              step: 1 },
  businessName:               { label: 'Business Name',                  step: 2 },
  businessRegistrationNumber: { label: 'Business Registration Number',   step: 2 },
  taxId:                      { label: 'Tax ID',                         step: 2 },
  address:                    { label: 'Address',                        step: 2 },
  postalCode:                 { label: 'Postal Code',                    step: 2 },
  city:                       { label: 'City',                           step: 2 },
  tradeRole:                  { label: 'Trade Role',                     step: 3 },
};

export type MissingField = { label: string; step: number };

export type RegistrationState = {
  error?: string;
  missingFields?: MissingField[];
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
    fullName:                   formData.get('fullName') as string,
    email:                      formData.get('email') as string,
    phoneNumber:                formData.get('phoneNumber') as string,
    country:                    formData.get('country') as string,
    businessName:               formData.get('businessName') as string,
    businessRegistrationNumber: formData.get('businessRegistrationNumber') as string,
    taxId:                      formData.get('taxId') as string,
    address:                    formData.get('address') as string,
    postalCode:                 formData.get('postalCode') as string,
    city:                       formData.get('city') as string,
    tradeRole:                  formData.get('tradeRole') as RegisterBusiness['tradeRole'],
  };

  const missingFields: MissingField[] = (Object.entries(payload) as [keyof RegisterBusiness, string][])
    .filter(([, value]) => !value?.trim())
    .map(([key]) => FIELD_META[key]);

  if (missingFields.length > 0) {
    return { error: 'Some required fields are incomplete.', missingFields };
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

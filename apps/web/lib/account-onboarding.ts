import type { Account } from '@workspace/schemas';

export const isBusinessOnboardingComplete = (account: Account | null | undefined) => {
  if (!account) return false;

  return (
    account.kind === 'BUSINESS' &&
    Boolean(account.fullName) &&
    Boolean(account.email) &&
    Boolean(account.phoneNumber) &&
    Boolean(account.country) &&
    Boolean(account.businessName) &&
    Boolean(account.businessRegistrationNumber) &&
    Boolean(account.taxId) &&
    Boolean(account.address) &&
    Boolean(account.postalCode) &&
    Boolean(account.city) &&
    Boolean(account.tradeRole)
  );
};
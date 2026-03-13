import { redirect } from "next/navigation"
import type { Account } from "@workspace/schemas"
import { LogoutButton } from "@/components/logout-button"
import { getAuthenticatedClient } from "@/lib/api-client";
import { isBusinessOnboardingComplete } from "@/lib/account-onboarding";

export default async function Page() {
  const client = await getAuthenticatedClient();

  try {
    const { data, response } = await client.GET('/accounts/me');
    if (response.status === 404) {
      redirect("/onboarding");
    }

    const account = data as Account | undefined;
    if (!isBusinessOnboardingComplete(account)) {
      redirect("/onboarding");
    }
  } catch {
    redirect("/onboarding");
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <LogoutButton />
      </div>
    </div>
  )
}

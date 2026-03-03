import { LogoutButton } from "@/components/logout-button"
import { getAuthenticatedClient } from "@/lib/api-client";

export default async function Page() {


  const client = await getAuthenticatedClient();
  const { data: account } = await client.GET('/accounts/me');

  console.log('account', account);


  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <LogoutButton />
      </div>
    </div>
  )
}

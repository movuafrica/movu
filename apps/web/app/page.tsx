import { LogoutButton } from "@/components/logout-button"
import { Button } from "@workspace/ui/components/button"
import { Account } from "@workspace/schemas";
import { apiFetch } from "@/lib/api";


const account: Account = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  userId: "123",
  kind: "PERSONAL",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default async function Page() {

  const accounts = await apiFetch("/accounts")
  console.log("accounts:", accounts)

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <p>{account.kind}</p>
        <div className="flex gap-2">
          <Button>Button</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}

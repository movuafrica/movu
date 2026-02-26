"use client"

import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"

export function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => signOut(() => router.push("/login"))}
    >
      Sign out
    </Button>
  )
}

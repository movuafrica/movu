import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Circle } from "lucide-react"
import Link from "next/link"
import { MovuLogo } from "@/components/movu-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { BusinessRegistrationForm } from "@/components/business-registration/form"
import { getAuthenticatedClient } from "@/lib/api-client"
import { isBusinessOnboardingComplete } from "@/lib/account-onboarding"
import { REGISTRATION_STEPS } from "@/components/business-registration/constants"
import type { Account } from "@workspace/schemas"

async function getCurrentAccount() {
  try {
    const client = await getAuthenticatedClient()
    const { data, response } = await client.GET("/accounts/me")
    if (response.status === 404) return null
    return (data as Account | undefined) ?? null
  } catch {
    return null
  }
}

export default async function BusinessRegistrationPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const account = await getCurrentAccount()
  if (isBusinessOnboardingComplete(account)) redirect("/")

  return (
    <div className="min-h-svh flex flex-col lg:flex-row">
      {/* Branded left panel — always dark regardless of theme */}
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop top-right controls */}
        <div className="hidden lg:flex justify-end px-8 pt-6">
          <ThemeToggle />
        </div>

        {/* Form area — on mobile the form fills the viewport; on desktop, centered */}
        <div className="flex-1 lg:flex lg:items-start lg:justify-center lg:py-10 lg:px-8">
          <div className="w-full lg:max-w-lg">
            <BusinessRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return []
}

export const dynamic = "force-dynamic"

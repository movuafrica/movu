import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { MovuLogo } from "@/components/movu-logo"
import Link from "next/link"

export default async function SignupPage() {
  const { userId } = await auth()
  if (userId) redirect("/")

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <MovuLogo />
        </Link>
        <SignupForm />
      </div>
    </div>
  )
}

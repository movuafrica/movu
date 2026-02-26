"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    setError("")
    const [firstName, ...rest] = name.trim().split(" ")
    const lastName = rest.join(" ")
    try {
      await signUp.create({ emailAddress: email, password, firstName, lastName })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message ?? "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message ?? "Invalid verification code.")
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your inbox</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <strong>{email}</strong>.
              <br />
              Enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification}>
              <FieldGroup>
                <Field className="flex flex-col items-center gap-4 py-2">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    autoFocus
                    containerClassName="w-full justify-between"
                  >
                    <InputOTPGroup className="w-full gap-2">
                      <InputOTPSlot index={0} className="h-14 w-full text-xl rounded-lg border" />
                      <InputOTPSlot index={1} className="h-14 w-full text-xl rounded-lg border" />
                      <InputOTPSlot index={2} className="h-14 w-full text-xl rounded-lg border" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="w-full gap-2">
                      <InputOTPSlot index={3} className="h-14 w-full text-xl rounded-lg border" />
                      <InputOTPSlot index={4} className="h-14 w-full text-xl rounded-lg border" />
                      <InputOTPSlot index={5} className="h-14 w-full text-xl rounded-lg border" />
                    </InputOTPGroup>
                  </InputOTP>
                  {error && (
                    <p className="text-destructive text-sm text-center">{error}</p>
                  )}
                </Field>
                <Field>
                  <Button type="submit" disabled={loading || code.length < 6}>
                    {loading ? "Verifying…" : "Verify email"}
                  </Button>
                  <FieldDescription className="text-center">
                    Didn&apos;t receive a code?{" "}
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      onClick={async () => {
                        await signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
                      }}
                    >
                      Resend
                    </button>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div id="clerk-captcha" />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account…" : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/login" className="underline-offset-4 hover:underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

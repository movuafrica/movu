"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
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

type View = "login" | "forgot" | "reset"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [view, setView] = useState<View>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      }
    } catch {
      setError("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email })
    } catch {
      // Swallow the error — always advance to mask whether the account exists
    } finally {
      setLoading(false)
    }
    setView("reset")
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isLoaded) return
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message ?? "Invalid code or password.")
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: "oauth_google") {
    if (!isLoaded) return
    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    })
  }

  if (view === "forgot") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending…" : "Send reset code"}
                  </Button>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      onClick={() => { setError(""); setView("login") }}
                    >
                      Back to login
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

  if (view === "reset") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Enter new password</CardTitle>
            <CardDescription>
              Enter the 6-digit security code that has been sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
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
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-password">New password</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-new-password">Confirm new password</FieldLabel>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                </Field>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Field>
                  <Button type="submit" disabled={loading || code.length < 6}>
                    {loading ? "Resetting…" : "Reset password"}
                  </Button>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline-offset-4 hover:underline"
                      onClick={async () => {
                        await signIn?.create({ strategy: "reset_password_email_code", identifier: email })
                      }}
                    >
                      Resend code
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
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div id="clerk-captcha" />
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleOAuth("oauth_google")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    onClick={() => { setError(""); setView("forgot") }}
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in…" : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="underline-offset-4 hover:underline">
                    Sign up
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

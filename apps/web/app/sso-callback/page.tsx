import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  return (
    <>
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback />
    </>
  )
}

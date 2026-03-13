"use client"

import { useState, useActionState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { ChevronLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  ContactDetailsStep,
  BusinessInfoStep,
  TradeCredentialsStep,
  DocumentsStep,
} from "./step-forms"
import { REGISTRATION_STEPS } from "./constants"
import { INITIAL_FORM_DATA } from "./types"
import type { RegistrationFormData } from "./types"
import { completeBusinessRegistration } from "@/actions/onboarding/complete-business-registration"
import { isValidPhoneNumber } from "./phone-input"
import { MovuLogo } from "../movu-logo"

const STEP_REQUIRED_FIELDS: (keyof RegistrationFormData)[][] = [
  ["fullName", "email", "phoneNumber", "country"],
  ["businessName", "businessRegistrationNumber", "taxId", "address", "postalCode", "city"],
  ["tradeRole"],
  [],
]

const STEP_TITLES = [
  "Personal Details",
  "Business Details",
  "Trade Credentials",
  "Upload Documents",
]

const STEP_SUBTITLES = [
  "Let's get to know you",
  "Let's set up your business for smoother shipment",
  "What's you primary trade role?",
  "Provude supporting documents",
]

export function BusinessRegistrationForm() {
  const [state, action, isPending] = useActionState(completeBusinessRegistration, null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_FORM_DATA)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName ?? prev.fullName,
      email: user.primaryEmailAddress?.emailAddress ?? prev.email,
    }))
  }, [user])

  const canProceed = () => {
    const fields = STEP_REQUIRED_FIELDS[step - 1]
    if (!fields) return true
    if (!fields.every((f) => formData[f].trim() !== "")) return false
    if (step === 1 && !isValidPhoneNumber(formData.phoneNumber)) return false
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectChange = (name: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const stepProps = { formData, onChange: handleChange, onSelectChange: handleSelectChange }

  return (
    <form
      action={action}
      className="flex flex-col min-h-svh lg:min-h-0 px-5 mt-5 pb-10 lg:px-0 lg:pt-0 lg:pb-0"
    >

      <MovuLogo />
      <p className="mt-2 text-sm text-muted-foreground">Register Your Business</p>
      {/* Hidden inputs so all fields are present when form submits on step 4 */}
      <input type="hidden" name="country" value={formData.country} />
      <input type="hidden" name="tradeRole" value={formData.tradeRole} />

      {/* Header: back button → progress → title → subtitle */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          aria-label="Go back"
          className={` -ml-1 flex items-center justify-center size-9 rounded-full text-foreground hover:bg-muted transition-colors ${step <= 1 ? "invisible pointer-events-none" : ""
            }`}
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Segmented progress bar */}
        <div className="flex gap-1.5 mb-7">
          {REGISTRATION_STEPS.map((s) => (
            <div
              key={s.number}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s.number <= step ? "bg-brand" : "bg-muted"
                }`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{STEP_TITLES[step - 1]}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {STEP_SUBTITLES[step - 1]}
        </p>
      </div>

      {/* Form fields */}
      <div className="flex-1 flex flex-col gap-5">
        <div className={step !== 1 ? "hidden" : ""}>
          <ContactDetailsStep {...stepProps} />
        </div>
        <div className={step !== 2 ? "hidden" : ""}>
          <BusinessInfoStep {...stepProps} />
        </div>
        <div className={step !== 3 ? "hidden" : ""}>
          <TradeCredentialsStep {...stepProps} />
        </div>
        <div className={step !== 4 ? "hidden" : ""}>
          <DocumentsStep />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>

      {/* Bottom action — sticks to bottom on mobile via mt-auto */}
      <div className="mt-10 lg:mt-6">
        {step < 4 ? (
          <Button
            type="button"
            disabled={!canProceed()}
            onClick={() => setStep((s) => s + 1)}
            className="w-full h-14 text-base rounded-xl font-semibold"
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-14 text-base rounded-xl font-semibold"
          >
            {isPending ? "Submitting…" : "Finish"}
          </Button>
        )}
      </div>
    </form>
  )
}

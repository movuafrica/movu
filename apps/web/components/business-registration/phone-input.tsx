"use client"

import * as React from "react"
import PhoneInputPrimitive, { isValidPhoneNumber, type Country } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@workspace/ui/lib/utils"

export { isValidPhoneNumber }

const BareInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "flex-1 min-w-0 bg-transparent text-base placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
)
BareInput.displayName = "PhoneInputField"

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  defaultCountry?: Country
  required?: boolean
  name?: string
}

export function PhoneInput({ value, onChange, defaultCountry = "ZA", required, name }: PhoneInputProps) {
  return (
    <div
      className={cn(
        "phone-input-field dark:bg-input/30 border-input flex h-14 items-center rounded-xl border bg-transparent px-4",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3 transition-colors"
      )}
    >
      <PhoneInputPrimitive
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        inputComponent={BareInput}
        required={required}
        name={name}
      />
    </div>
  )
}

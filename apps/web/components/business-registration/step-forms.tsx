"use client"

import { useState } from "react"
import { CheckCircle, FolderOpen, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { COUNTRIES, TRADE_ROLE_LABELS } from "./constants"
import { PhoneInput } from "./phone-input"
import type { StepProps } from "./types"

const INPUT_CLS = "h-14 px-4 text-base rounded-xl"
const SELECT_TRIGGER_CLS = "!h-14 px-4 text-base rounded-xl"

export function ContactDetailsStep({ formData, onChange, onSelectChange }: StepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
        <Input id="fullName" name="fullName" placeholder="Your full name" value={formData.fullName} onChange={onChange} required className={INPUT_CLS} />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" placeholder="Your email address" value={formData.email} onChange={onChange} required disabled className={INPUT_CLS} />
      </Field>
      <Field>
        <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
        <PhoneInput
          value={formData.phoneNumber}
          onChange={(v) => onSelectChange("phoneNumber", v)}
          required
        />
      </Field>
      <Field>
        <FieldLabel>Country</FieldLabel>
        <Select value={formData.country} onValueChange={(v) => onSelectChange("country", v)}>
          <SelectTrigger className={SELECT_TRIGGER_CLS}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}

export function BusinessInfoStep({ formData, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
        <Input id="businessName" name="businessName" placeholder="What's your business name?" value={formData.businessName} onChange={onChange} required className={INPUT_CLS} />
      </Field>
      <Field>
        <FieldLabel htmlFor="businessRegistrationNumber">Business Registration Number</FieldLabel>
        <Input id="businessRegistrationNumber" name="businessRegistrationNumber" placeholder="Add your registration number" value={formData.businessRegistrationNumber} onChange={onChange} required className={INPUT_CLS} />
      </Field>
      <Field>
        <FieldLabel htmlFor="taxId">Tax Identification Number (TIN)</FieldLabel>
        <Input id="taxId" name="taxId" placeholder="Provide your tax ID" value={formData.taxId} onChange={onChange} required className={INPUT_CLS} />
      </Field>
      <Field>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <Input id="address" name="address" placeholder="Start typing your address" value={formData.address} onChange={onChange} required className={INPUT_CLS} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="postalCode">Postal Code</FieldLabel>
          <Input id="postalCode" name="postalCode" placeholder="Postal code" value={formData.postalCode} onChange={onChange} required className={INPUT_CLS} />
        </Field>
        <Field>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <Input id="city" name="city" placeholder="Add your city" value={formData.city} onChange={onChange} required className={INPUT_CLS} />
        </Field>
      </div>
    </FieldGroup>
  )
}

export function TradeCredentialsStep({ formData, onSelectChange }: StepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Register as</FieldLabel>
        <Select value={formData.tradeRole} onValueChange={(v) => onSelectChange("tradeRole", v)}>
          <SelectTrigger className={SELECT_TRIGGER_CLS}>
            <SelectValue placeholder="Select trade role" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRADE_ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}

type DocItemProps = {
  label: string;
  fileName: string | null;
  onFileChange: (name: string | null) => void;
};

function DocumentUploadItem({ label, fileName, onFileChange }: DocItemProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0]?.name ?? null)
  }

  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <p className="mb-3 text-sm font-medium">{label}</p>
      {fileName ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="size-10 text-brand" />
          <p className="text-sm text-muted-foreground truncate max-w-full">{fileName}</p>
          <Button type="button" variant="destructive" size="sm" onClick={() => onFileChange(null)}>
            <X className="size-3.5" />
            Remove
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-2 cursor-pointer">
          <FolderOpen className="size-10 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">Upload your {label.toLowerCase()}</p>
          <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInput} />
          <Button type="button" variant="outline" size="sm" asChild>
            <span>Upload</span>
          </Button>
        </label>
      )}
    </div>
  )
}

export function DocumentsStep() {
  const [companyRegName, setCompanyRegName] = useState<string | null>(null)
  const [taxIdDocName, setTaxIdDocName] = useState<string | null>(null)

  return (
    <FieldGroup>
      <DocumentUploadItem
        label="Company Registration Certificate"
        fileName={companyRegName}
        onFileChange={setCompanyRegName}
      />
      <DocumentUploadItem
        label="Tax Identification (TIN/VAT)"
        fileName={taxIdDocName}
        onFileChange={setTaxIdDocName}
      />
    </FieldGroup>
  )
}

"use client"

import { Package2, MapPin, Calendar, Weight, FileText, Hash } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"

const CARGO_TYPES = [
  "Electronics",
  "Industrial Machinery",
  "Petrochemicals",
  "Textiles",
  "Automotive Parts",
  "Consumer Goods",
  "Pharmaceuticals",
  "Raw Materials",
  "Food & Beverage",
  "Other",
]

const CARRIERS = [
  "COSCO Shipping",
  "MSC",
  "Maersk Line",
  "Hapag-Lloyd",
  "NYK Line",
  "PIL",
  "CMA CGM",
  "Evergreen",
]

const STATUSES = [
  { value: "proposed", label: "Proposed" },
  { value: "scheduled", label: "Scheduled" },
  { value: "loading", label: "Loading" },
  { value: "in_transit", label: "In Transit" },
  { value: "delayed", label: "Delayed" },
  { value: "delivered", label: "Delivered" },
]

export function CreateShipmentSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-[#00BCA8] hover:bg-[#00a894] text-black font-semibold">
          <Package2 className="size-4" />
          Log Shipment
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] overflow-y-auto bg-background border-l border-border/60 gap-0 p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#00BCA8]/10 border border-[#00BCA8]/20">
              <Package2 className="size-4 text-[#00BCA8]" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold">Log Existing Shipment</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Add an already-booked shipment to track its progress
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <div className="px-6 py-5 space-y-6">
          {/* Booking Reference */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="size-3.5 text-[#00BCA8]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Booking Reference
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bol" className="text-xs font-medium">Bill of Lading / AWB</Label>
                <Input
                  id="bol"
                  placeholder="e.g. COSU1234567890"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-ref" className="text-xs font-medium">Carrier Booking Ref</Label>
                <Input
                  id="booking-ref"
                  placeholder="e.g. BKG-00123"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="current-status" className="text-xs font-medium">Current Status</Label>
              <select
                id="current-status"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Route */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Route
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="origin" className="text-xs font-medium">Origin Port / City</Label>
                <Input
                  id="origin"
                  placeholder="e.g. Shanghai, CN"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination" className="text-xs font-medium">Destination Port / City</Label>
                <Input
                  id="destination"
                  placeholder="e.g. Los Angeles, US"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="corridor" className="text-xs font-medium">Trade Corridor</Label>
              <Input
                id="corridor"
                placeholder="e.g. Trans-Pacific, North Atlantic"
                className="h-9 text-sm"
              />
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Schedule */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Schedule
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="departure" className="text-xs font-medium">Actual Departure</Label>
                <Input id="departure" type="date" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eta" className="text-xs font-medium">Estimated Arrival</Label>
                <Input id="eta" type="date" className="h-9 text-sm" />
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Cargo */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Package2 className="size-3.5 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cargo
              </span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargo-type" className="text-xs font-medium">Cargo Type</Label>
              <select
                id="cargo-type"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Select cargo type…</option>
                {CARGO_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs font-medium">
                  <Weight className="inline size-3 mr-1" />
                  Gross Weight (t)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="volume" className="text-xs font-medium">Volume (CBM)</Label>
                <Input
                  id="volume"
                  type="number"
                  placeholder="0"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Carrier */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Carrier &amp; Vessel
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="carrier" className="text-xs font-medium">Carrier</Label>
                <select
                  id="carrier"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">Select carrier…</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vessel" className="text-xs font-medium">Vessel Name</Label>
                <Input
                  id="vessel"
                  placeholder="e.g. MSC OSCAR"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Notes */}
          <section className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </span>
            <textarea
              placeholder="Tracking notes, customs reference, etc."
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 resize-none dark:bg-input/30"
            />
          </section>
        </div>

        <Separator />

        <SheetFooter className="px-6 py-4 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1">
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#00BCA8] hover:bg-[#00a894] text-black font-semibold"
          >
            <Package2 className="size-3.5 mr-1.5" />
            Log Shipment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

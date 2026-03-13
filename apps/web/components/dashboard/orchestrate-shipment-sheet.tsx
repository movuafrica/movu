"use client"

import { useState } from "react"
import {
  GitBranch,
  Map,
  ShieldCheck,
  FileCheck2,
  Clock,
  ChevronRight,
  Anchor,
  Globe,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react"
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
import { Badge } from "@workspace/ui/components/badge"

const CORRIDORS = [
  { id: "trans-pac", label: "Trans-Pacific", route: "Asia → North America", legs: 1 },
  { id: "north-atl", label: "North Atlantic", route: "Europe → North America", legs: 1 },
  { id: "me-europe", label: "Middle East–Europe", route: "Gulf → NW Europe", legs: 2 },
  { id: "sea-aus", label: "SE Asia–Australia", route: "ASEAN → Oceania", legs: 1 },
  { id: "indian-eu", label: "Indian Ocean–Europe", route: "South Asia → Europe", legs: 2 },
  { id: "custom", label: "Custom Route", route: "Define your own", legs: 0 },
]

const MILESTONES = [
  { id: "docs", label: "Documentation Ready", icon: FileCheck2 },
  { id: "customs", label: "Export Customs Clearance", icon: ShieldCheck },
  { id: "carrier", label: "Carrier Booking Confirmed", icon: Anchor },
  { id: "loading", label: "Cargo Loading", icon: Globe },
  { id: "transit", label: "In Transit", icon: Clock },
  { id: "arrival", label: "Arrival & Import Clearance", icon: CheckCircle2 },
]

export function OrchestrateShipmentSheet() {
  const [selectedCorridor, setSelectedCorridor] = useState("")
  const [routeType, setRouteType] = useState<"direct" | "multileg">("direct")
  const [requirements, setRequirements] = useState({
    customs: true,
    insurance: false,
    broker: false,
    hazmat: false,
    refrigerated: false,
    oversized: false,
  })

  const toggleRequirement = (key: keyof typeof requirements) =>
    setRequirements((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-400/60 font-semibold"
        >
          <GitBranch className="size-4" />
          Orchestrate
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[560px] overflow-y-auto bg-background border-l border-border/60 p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
              <GitBranch className="size-4 text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold">Orchestrate Shipment</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Plan and coordinate a full logistics chain
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <div className="px-6 py-5 space-y-6">
          {/* Shipment Reference */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reference
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ref-shipment" className="text-xs font-medium">Link to Shipment ID</Label>
                <Input
                  id="ref-shipment"
                  placeholder="SHP-2026-XXXX"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ref-po" className="text-xs font-medium">Purchase Order #</Label>
                <Input
                  id="ref-po"
                  placeholder="PO-XXXX"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Trade Corridor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Map className="size-3.5 text-[#00BCA8]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trade Corridor
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {CORRIDORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCorridor(c.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                    selectedCorridor === c.id
                      ? "border-purple-500/50 bg-purple-500/8 text-foreground"
                      : "border-border/60 hover:border-border hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold">{c.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{c.route}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.legs > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                        {c.legs}-leg
                      </Badge>
                    )}
                    <ChevronRight className={`size-3.5 transition-transform ${selectedCorridor === c.id ? "rotate-90 text-purple-400" : "opacity-30"}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Route Type */}
          <section className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Route Type
            </span>
            <div className="flex gap-2">
              {(["direct", "multileg"] as const).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setRouteType(rt)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all duration-150 capitalize ${
                    routeType === rt
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {rt === "direct" ? "Direct Route" : "Multi-Leg Route"}
                </button>
              ))}
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Requirements */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requirements & Services
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(requirements) as Array<keyof typeof requirements>).map((key) => {
                const labels: Record<keyof typeof requirements, string> = {
                  customs: "Customs Clearance",
                  insurance: "Cargo Insurance",
                  broker: "Freight Broker",
                  hazmat: "Hazmat Handling",
                  refrigerated: "Refrigerated (Reefer)",
                  oversized: "Oversized Cargo",
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleRequirement(key)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-150 ${
                      requirements[key]
                        ? "border-[#00BCA8]/40 bg-[#00BCA8]/8 text-[#00BCA8]"
                        : "border-border/60 text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                        requirements[key]
                          ? "bg-[#00BCA8] border-[#00BCA8]"
                          : "border-border"
                      }`}
                    >
                      {requirements[key] && (
                        <CheckCircle2 className="size-2.5 text-black" />
                      )}
                    </div>
                    <span className="font-medium">{labels[key]}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Milestone Timeline */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Milestone Timeline
              </span>
            </div>
            <div className="relative pl-4 space-y-0">
              {MILESTONES.map((m, i) => (
                <div key={m.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  {/* Connector line */}
                  {i < MILESTONES.length - 1 && (
                    <div className="absolute left-[5px] top-5 bottom-0 w-px bg-border/60" />
                  )}
                  <div className="relative z-10 flex size-3 mt-1 shrink-0 items-center justify-center rounded-full bg-border">
                    <div className="size-1.5 rounded-full bg-muted-foreground/50" />
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2">
                      <m.icon className="size-3 text-muted-foreground/70 shrink-0" />
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </div>
                    <Input
                      type="date"
                      className="h-6 w-32 text-[10px] font-mono px-2 shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Broker Assignment */}
          <section className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Broker Assignment
            </span>
            <Input
              placeholder="Search broker by name or ID…"
              className="h-9 text-sm"
            />
          </section>

          {/* Notes */}
          <section className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Orchestration Notes
            </span>
            <textarea
              placeholder="Coordination notes, compliance requirements, special instructions…"
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 resize-none dark:bg-input/30"
            />
          </section>
        </div>

        <Separator />

        <SheetFooter className="px-6 py-4 flex gap-3">
          <Button variant="outline" size="sm" className="flex-1">
            Save as Draft
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold"
          >
            <GitBranch className="size-3.5 mr-1.5" />
            Orchestrate Shipment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

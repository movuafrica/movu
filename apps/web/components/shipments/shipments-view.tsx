"use client"

import { useState, useMemo } from "react"
import type { ElementType } from "react"
import {
  Ship,
  Clock,
  Anchor,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

import { SHIPMENTS, CORRIDORS } from "@/lib/demo-data"
import type { Shipment, ShipmentStatus } from "@/lib/demo-data"
import { OrchestrateShipmentSheet } from "@/components/dashboard/orchestrate-shipment-sheet"
import { ShipmentDetailSheet } from "@/components/shipments/shipment-detail-sheet"

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; textColor: string; bgColor: string; borderColor: string; icon: ElementType }
> = {
  in_transit: {
    label: "In Transit",
    textColor: "text-[#00BCA8]",
    bgColor: "bg-[#00BCA8]/10",
    borderColor: "border-[#00BCA8]/30",
    icon: Ship,
  },
  loading: {
    label: "Loading",
    textColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Anchor,
  },
  scheduled: {
    label: "Scheduled",
    textColor: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    icon: Clock,
  },
  proposed: {
    label: "Proposed",
    textColor: "text-slate-400",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/30",
    icon: FileText,
  },
  delivered: {
    label: "Delivered",
    textColor: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    icon: CheckCircle2,
  },
  delayed: {
    label: "Delayed",
    textColor: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    icon: AlertTriangle,
  },
}

const STATUS_TABS: Array<{ value: ShipmentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "in_transit", label: "In Transit" },
  { value: "loading", label: "Loading" },
  { value: "scheduled", label: "Scheduled" },
  { value: "proposed", label: "Proposed" },
  { value: "delayed", label: "Delayed" },
]

const CORRIDOR_OPTIONS = [
  "All Corridors",
  ...Array.from(new Set(CORRIDORS.map((c) => c.name))),
]

export function ShipmentsView() {
  const [activeTab, setActiveTab] = useState<ShipmentStatus | "all">("all")
  const [activeCorridor, setActiveCorridor] = useState("All Corridors")
  const [search, setSearch] = useState("")
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return SHIPMENTS.filter((s) => {
      if (activeTab !== "all" && s.status !== activeTab) return false
      if (activeCorridor !== "All Corridors" && s.corridor !== activeCorridor) return false
      if (q) {
        const haystack = [s.id, s.origin, s.destination, s.cargo, s.carrier]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [activeTab, activeCorridor, search])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {SHIPMENTS.length} total shipments
          </p>
        </div>
        <OrchestrateShipmentSheet />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-all",
                activeTab === tab.value
                  ? "bg-[#00BCA8] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corridor dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 gap-2 text-sm"
            >
              {activeCorridor}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {CORRIDOR_OPTIONS.map((c) => (
              <DropdownMenuItem
                key={c}
                onClick={() => setActiveCorridor(c)}
                className={cn(activeCorridor === c && "text-[#00BCA8] font-medium")}
              >
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="relative ml-auto w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search shipments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm border-border/60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              {["ID", "Route", "Cargo & Weight", "Carrier / Vessel", "ETA", "Value", "Status", "Progress"].map(
                (col) => (
                  <th
                    key={col}
                    className={cn(
                      "px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-left",
                      col === "Value" && "text-right",
                      col === "Progress" && "text-right"
                    )}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No shipments match your filters
                </td>
              </tr>
            ) : (
              filtered.map((shipment) => {
                const cfg = STATUS_CONFIG[shipment.status]
                const StatusIcon = cfg.icon
                const showProgress =
                  shipment.status === "in_transit" || shipment.status === "loading"

                return (
                  <tr
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {shipment.id}
                      </span>
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-xs font-mono">{shipment.originCode}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="text-xs font-mono">{shipment.destinationCode}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {shipment.origin} → {shipment.destination}
                      </div>
                    </td>

                    {/* Cargo & Weight */}
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{shipment.cargo}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {shipment.weight}
                      </div>
                    </td>

                    {/* Carrier / Vessel */}
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{shipment.carrier}</div>
                      {shipment.vessel !== "—" && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {shipment.vessel}
                        </div>
                      )}
                    </td>

                    {/* ETA */}
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div>{shipment.eta}</div>
                      {shipment.daysOut > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {shipment.daysOut}d out
                        </div>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 text-sm text-right font-medium tabular-nums">
                      {shipment.value}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                          cfg.textColor,
                          cfg.bgColor,
                          cfg.borderColor
                        )}
                      >
                        <StatusIcon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3 text-sm text-right">
                      {showProgress ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {shipment.progress}%
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                shipment.status === "in_transit"
                                  ? "bg-[#00BCA8]"
                                  : "bg-blue-500"
                              )}
                              style={{ width: `${shipment.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sheets */}
      <ShipmentDetailSheet
        shipment={selectedShipment}
        open={!!selectedShipment}
        onOpenChange={(open) => {
          if (!open) setSelectedShipment(null)
        }}
      />
    </div>
  )
}

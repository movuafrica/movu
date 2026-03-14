"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { CORRIDORS, type Corridor } from "@/lib/demo-data"
import { CorridorDetailSheet } from "./corridor-detail-sheet"

function onTimeColor(rate: number): string {
  if (rate >= 85) return "text-emerald-600 dark:text-emerald-400"
  if (rate >= 70) return "text-blue-500"
  return "text-red-500"
}

function StatChip({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-2.5 flex items-center gap-3">
      <span className="text-xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function CorridorCard({
  corridor,
  onSelect,
}: {
  corridor: Corridor
  onSelect: (c: Corridor) => void
}) {
  return (
    <div className="border border-border/60 rounded-xl p-5 bg-card flex flex-col gap-4 hover:border-[#00BCA8]/40 hover:shadow-sm transition-all">
      {/* Top: flags + name + regions */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-1 text-2xl leading-none shrink-0">
          <span>{corridor.originFlag}</span>
          <span className="text-base text-muted-foreground">→</span>
          <span>{corridor.destFlag}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm leading-snug truncate">
            {corridor.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {corridor.originRegion} → {corridor.destRegion}
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats 2×2 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Active Shipments</p>
          <p className="text-sm font-semibold mt-0.5">
            {corridor.activeShipments}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg Transit</p>
          <p className="text-sm font-semibold mt-0.5">
            {corridor.avgTransitDays}d
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">On-Time Rate</p>
          <p
            className={cn(
              "text-sm font-semibold mt-0.5",
              onTimeColor(corridor.onTimeRate)
            )}
          >
            {corridor.onTimeRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Preferred Carrier</p>
          <p className="text-sm font-semibold mt-0.5 truncate">
            {corridor.preferredCarrier}
          </p>
        </div>
      </div>

      {/* Footer action */}
      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[#00BCA8] hover:text-[#00BCA8] hover:bg-[#00BCA8]/10"
          onClick={() => onSelect(corridor)}
        >
          View Details →
        </Button>
      </div>
    </div>
  )
}

export function CorridorsView() {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null)

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Trade Corridors</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configured trade lanes and route performance
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button variant="outline" size="sm" disabled>
                  <Plus className="size-4" />
                  New Corridor
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">Coming soon</TooltipContent>
          </Tooltip>
        </div>

        {/* Stats bar */}
        {/* Commented out — too few corridors to warrant summary stats
        <div className="flex flex-wrap gap-2">
          <StatChip label="Corridors" value={CORRIDORS.length} />
          <StatChip label="Active Shipments" value={totalActiveShipments} />
          <StatChip label="Avg On-Time" value={`${avgOnTime}%`} />
          <StatChip label="Total Shipments" value={totalShipments} />
        </div>
        */}

        {/* Search */}
        {/* Commented out — not needed with a small number of corridors
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search corridors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        */}

        {/* Bento grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {CORRIDORS.map((c) => (
            <CorridorCard
              key={c.id}
              corridor={c}
              onSelect={setSelectedCorridor}
            />
          ))}
        </div>

        {/* Detail sheet */}
        <CorridorDetailSheet
          corridor={selectedCorridor}
          open={!!selectedCorridor}
          onOpenChange={(open) => !open && setSelectedCorridor(null)}
        />
      </div>
    </TooltipProvider>
  )
}

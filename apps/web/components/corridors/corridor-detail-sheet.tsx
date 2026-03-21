"use client"

import { Ship } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import type { Corridor } from "@/lib/demo-data"

interface CorridorDetailSheetProps {
  corridor: Corridor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function onTimeColor(rate: number): string {
  if (rate >= 85) return "text-emerald-600 dark:text-emerald-400"
  if (rate >= 70) return "text-blue-500"
  return "text-red-500"
}

// Scale a map coord (0–1000 x / 0–500 y) into SVG viewBox 700×160
function scaleX(x: number): number {
  return Math.round((x / 1000) * 680) + 10
}
function scaleY(y: number): number {
  return Math.round((y / 500) * 140) + 10
}

export function CorridorDetailSheet({
  corridor,
  open,
  onOpenChange,
}: CorridorDetailSheetProps) {
  if (!corridor) return null

  const ox = scaleX(corridor.originMapX)
  const oy = scaleY(corridor.originMapY)
  const dx = scaleX(corridor.destMapX)
  const dy = scaleY(corridor.destMapY)
  const midX = (ox + dx) / 2
  const midY = Math.min(oy, dy) - 40
  const shipX = midX
  const shipY = midY + 4

  const stats = [
    { label: "Total Shipments", value: String(corridor.totalShipments) },
    { label: "Avg Transit", value: `${corridor.avgTransitDays} days` },
    {
      label: "On-Time Rate",
      value: `${corridor.onTimeRate}%`,
      colorClass: onTimeColor(corridor.onTimeRate),
    },
    { label: "Total Value", value: corridor.totalValue },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-[760px]"
        side="right"
      >
        {/* Header */}
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">
              {corridor.originFlag}
            </span>
            <span className="mt-1 text-xl leading-none text-muted-foreground">
              →
            </span>
            <span className="text-3xl leading-none">{corridor.destFlag}</span>
            <div className="ml-1">
              <SheetTitle className="text-xl font-bold leading-tight">
                {corridor.name}
              </SheetTitle>
              <div className="mt-1.5 flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {corridor.originRegion}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {corridor.destRegion}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Section 1 — Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
              >
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p
                  className={cn(
                    "mt-1 text-xl font-semibold",
                    s.colorClass ?? "text-foreground"
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Section 2 — Route Map */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Route
            </h3>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-900/50">
              <svg
                viewBox="0 0 700 160"
                width="100%"
                height="160"
                aria-label={`Route from ${corridor.originRegion} to ${corridor.destRegion}`}
              >
                {/* Dashed arc */}
                <path
                  d={`M ${ox},${oy} Q ${midX},${midY} ${dx},${dy}`}
                  fill="none"
                  stroke="#00BCA8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />

                {/* Origin port circle */}
                <circle cx={ox} cy={oy} r="6" fill="#00BCA8" />
                <text
                  x={ox}
                  y={oy + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="fill-foreground"
                >
                  {corridor.originFlag} {corridor.originRegion}
                </text>

                {/* Destination port circle */}
                <circle cx={dx} cy={dy} r="6" fill="#00BCA8" />
                <text
                  x={dx}
                  y={dy + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="fill-foreground"
                >
                  {corridor.destFlag} {corridor.destRegion}
                </text>

                {/* Ship icon at arc midpoint — rendered via foreignObject */}
                <foreignObject
                  x={shipX - 10}
                  y={shipY - 10}
                  width="20"
                  height="20"
                >
                  <div
                    // @ts-expect-error xmlns needed for foreignObject
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="flex items-center justify-center text-[#00BCA8]"
                  >
                    <Ship size={16} />
                  </div>
                </foreignObject>
              </svg>
            </div>
          </div>

          <Separator />

          {/* Section 3 — Carrier Rankings */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Carrier Rankings
            </h3>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Carrier
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shipments
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Avg Days
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      On-Time Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {corridor.carrierRankings.map((r, i) => (
                    <tr
                      key={r.carrier}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {i === 0 && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400/20 text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                              #1
                            </span>
                          )}
                          {r.carrier}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {r.shipments}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {r.avgDays}d
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                r.onTimeRate >= 85
                                  ? "bg-emerald-500"
                                  : r.onTimeRate >= 70
                                    ? "bg-blue-500"
                                    : "bg-red-500"
                              )}
                              style={{ width: `${r.onTimeRate}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              onTimeColor(r.onTimeRate)
                            )}
                          >
                            {r.onTimeRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Section 4 — Incoterms */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Incoterms
            </h3>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-4">
              <Badge
                variant="outline"
                className="shrink-0 border-[#00BCA8]/40 text-[#00BCA8] text-sm font-bold px-3 h-7"
              >
                {corridor.incoterms}
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {corridor.incotermNote}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t px-6 py-4">
          <Button
            className="w-full bg-[#00BCA8] text-white hover:bg-[#00a896] active:bg-[#009485]"
            onClick={() =>
              console.log("Use This Corridor:", corridor.id)
            }
          >
            Use This Corridor
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

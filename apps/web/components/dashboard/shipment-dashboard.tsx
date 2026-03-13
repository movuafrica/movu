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
  ChevronDown,
  Activity,
  TrendingUp,
  Package2,
  Globe,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CreateShipmentSheet } from "./create-shipment-sheet"
import { OrchestrateShipmentSheet } from "./orchestrate-shipment-sheet"

// ─── Types ────────────────────────────────────────────────────────────────────

type ShipmentStatus = "in_transit" | "loading" | "scheduled" | "proposed" | "delivered" | "delayed"

interface Shipment {
  id: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  eta: string
  daysOut: number
  cargo: string
  weight: string
  status: ShipmentStatus
  carrier: string
  vessel: string
  progress: number
  corridor: string
  value: string
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const SHIPMENTS: Shipment[] = [
  {
    id: "SHP-2026-0142",
    origin: "Shanghai",
    originCode: "SHA",
    destination: "Los Angeles",
    destinationCode: "LAX",
    eta: "Mar 18, 2026",
    daysOut: 5,
    cargo: "Electronics",
    weight: "24.5t",
    status: "in_transit",
    carrier: "COSCO Shipping",
    vessel: "COSCO PACIFIC",
    progress: 68,
    corridor: "Trans-Pacific",
    value: "$1.2M",
  },
  {
    id: "SHP-2026-0148",
    origin: "Hamburg",
    originCode: "HAM",
    destination: "New York",
    destinationCode: "NYC",
    eta: "Mar 21, 2026",
    daysOut: 8,
    cargo: "Industrial Machinery",
    weight: "38.2t",
    status: "loading",
    carrier: "MSC",
    vessel: "MSC OSCAR",
    progress: 15,
    corridor: "North Atlantic",
    value: "$840K",
  },
  {
    id: "SHP-2026-0153",
    origin: "Dubai",
    originCode: "DXB",
    destination: "Rotterdam",
    destinationCode: "RTM",
    eta: "Mar 24, 2026",
    daysOut: 11,
    cargo: "Petrochemicals",
    weight: "52.1t",
    status: "scheduled",
    carrier: "Maersk Line",
    vessel: "MAERSK ESSEN",
    progress: 0,
    corridor: "Middle East-Europe",
    value: "$2.1M",
  },
  {
    id: "SHP-2026-0139",
    origin: "Tokyo",
    originCode: "TKO",
    destination: "Seattle",
    destinationCode: "SEA",
    eta: "Mar 25, 2026",
    daysOut: 12,
    cargo: "Automotive Parts",
    weight: "18.7t",
    status: "proposed",
    carrier: "NYK Line",
    vessel: "—",
    progress: 0,
    corridor: "Trans-Pacific",
    value: "$560K",
  },
  {
    id: "SHP-2026-0137",
    origin: "Mumbai",
    originCode: "BOM",
    destination: "London",
    destinationCode: "LHR",
    eta: "Mar 27, 2026",
    daysOut: 14,
    cargo: "Textiles",
    weight: "12.3t",
    status: "proposed",
    carrier: "Hapag-Lloyd",
    vessel: "—",
    progress: 0,
    corridor: "Indian Ocean-Europe",
    value: "$290K",
  },
  {
    id: "SHP-2026-0131",
    origin: "Singapore",
    originCode: "SIN",
    destination: "Sydney",
    destinationCode: "SYD",
    eta: "Mar 16, 2026",
    daysOut: 3,
    cargo: "Consumer Goods",
    weight: "9.4t",
    status: "in_transit",
    carrier: "PIL",
    vessel: "KOTA RAJIN",
    progress: 82,
    corridor: "SE Asia-Australia",
    value: "$178K",
  },
  {
    id: "SHP-2026-0129",
    origin: "Rotterdam",
    originCode: "RTM",
    destination: "São Paulo",
    destinationCode: "GRU",
    eta: "Mar 14, 2026",
    daysOut: 1,
    cargo: "Pharmaceuticals",
    weight: "3.2t",
    status: "delayed",
    carrier: "CMA CGM",
    vessel: "CMA LIBRA",
    progress: 91,
    corridor: "Europe-South America",
    value: "$4.5M",
  },
]

const PIE_DATA = [
  { label: "In Transit", value: 8, color: "#00BCA8" },
  { label: "Scheduled", value: 5, color: "#3B82F6" },
  { label: "Loading", value: 3, color: "#F59E0B" },
  { label: "Proposed", value: 4, color: "#A855F7" },
]

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
    textColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
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
    textColor: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
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

const DATE_RANGES = ["Today", "This Week", "This Month", "Quarter"] as const
type DateRange = typeof DATE_RANGES[number]

const CORRIDORS = [
  "All Corridors",
  "Trans-Pacific",
  "North Atlantic",
  "Middle East-Europe",
  "SE Asia-Australia",
  "Indian Ocean-Europe",
  "Europe-South America",
]

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
) {
  const o1 = polar(cx, cy, outerR, startAngle)
  const o2 = polar(cx, cy, outerR, endAngle)
  const i1 = polar(cx, cy, innerR, endAngle)
  const i2 = polar(cx, cy, innerR, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    `Z`,
  ].join(" ")
}

function DonutChart({ data }: { data: typeof PIE_DATA }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const cx = 100
  const cy = 100
  const outerR = 82
  const innerR = 54
  const gap = 3
  const total = data.reduce((s, d) => s + d.value, 0)

  let cumAngle = 0
  const slices = data.map((d) => {
    const fullAngle = (d.value / total) * 360
    const startAngle = cumAngle + gap / 2
    const endAngle = cumAngle + fullAngle - gap / 2
    cumAngle += fullAngle
    return { ...d, startAngle, endAngle }
  })

  const active = hovered !== null ? slices[hovered] : null

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-[150px] h-[150px]">
        {slices.map((slice, i) => {
          const path = donutSlicePath(cx, cy, outerR, innerR, slice.startAngle, slice.endAngle)
          const isActive = hovered === i
          return (
            <path
              key={i}
              d={path}
              fill={slice.color}
              opacity={hovered !== null && !isActive ? 0.35 : 1}
              className="transition-all duration-150 cursor-pointer"
              style={{
                filter: isActive ? `drop-shadow(0 0 10px ${slice.color}90)` : "none",
                transform: isActive ? "scale(1.04)" : "scale(1)",
                transformOrigin: "100px 100px",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* Center */}
        {active ? (
          <>
            <text
              x={cx}
              y={cy - 9}
              textAnchor="middle"
              style={{ fontSize: "22px", fontWeight: "700", fill: active.color }}
            >
              {active.value}
            </text>
            <text
              x={cx}
              y={cy + 9}
              textAnchor="middle"
              style={{ fontSize: "9px", fill: "oklch(0.5177 0.0447 216.5417)", letterSpacing: "0.05em" }}
            >
              {active.label.toUpperCase()}
            </text>
          </>
        ) : (
          <>
            <text
              x={cx}
              y={cy - 7}
              textAnchor="middle"
              style={{ fontSize: "26px", fontWeight: "700", fill: "currentColor" }}
            >
              {total}
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              style={{ fontSize: "9px", fill: "oklch(0.5177 0.0447 216.5417)", letterSpacing: "0.05em" }}
            >
              SHIPMENTS
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="w-full space-y-1">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition-colors hover:bg-muted/30"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-mono font-semibold tabular-nums">{d.value}</span>
              <span className="text-muted-foreground/60">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide font-mono ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor}`}
    >
      <Icon className="size-2.5 shrink-0" />
      {cfg.label}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ─── Upcoming Shipment Card ───────────────────────────────────────────────────

function UpcomingShipmentCard({ shipment }: { shipment: Shipment }) {
  const cfg = STATUS_CONFIG[shipment.status]
  const color =
    shipment.status === "in_transit"
      ? "#00BCA8"
      : shipment.status === "loading"
      ? "#F59E0B"
      : shipment.status === "delayed"
      ? "#EF4444"
      : "#3B82F6"

  return (
    <Card
      className={`relative overflow-hidden border-border/60 bg-card/60 hover:border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group cursor-pointer`}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
        style={{ backgroundColor: color }}
      />

      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">{shipment.id}</span>
          <StatusBadge status={shipment.status} />
        </div>

        {/* Route */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span>{shipment.origin}</span>
            <ArrowRight className="size-3.5 text-muted-foreground/60 shrink-0" />
            <span>{shipment.destination}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{shipment.originCode}</span>
            <span className="opacity-40">→</span>
            <span className="font-mono">{shipment.destinationCode}</span>
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Cargo + ETA row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground/70 uppercase tracking-wide text-[10px] font-semibold mb-0.5">Cargo</p>
            <p className="font-medium truncate">{shipment.cargo}</p>
            <p className="text-muted-foreground font-mono">{shipment.weight}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground/70 uppercase tracking-wide text-[10px] font-semibold mb-0.5">ETA</p>
            <p className="font-medium">{shipment.eta}</p>
            <p className="text-muted-foreground font-mono">
              {shipment.daysOut === 0
                ? "Today"
                : shipment.daysOut === 1
                ? "Tomorrow"
                : `in ${shipment.daysOut}d`}
            </p>
          </div>
        </div>

        {/* Carrier */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Anchor className="size-3 shrink-0 opacity-60" />
          <span className="truncate">{shipment.carrier}</span>
          {shipment.vessel !== "—" && (
            <>
              <span className="opacity-40">·</span>
              <span className="font-mono text-[10px] truncate opacity-70">{shipment.vessel}</span>
            </>
          )}
        </div>

        {/* Progress */}
        {shipment.progress > 0 && (
          <div className="space-y-1">
            <ProgressBar value={shipment.progress} color={color} />
            <p className="text-[10px] text-muted-foreground/60 text-right font-mono">{shipment.progress}% complete</p>
          </div>
        )}

        {/* Corridor badge */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Globe className="size-3 shrink-0" />
          <span>{shipment.corridor}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ShipmentDashboard({ firstName }: { firstName: string }) {
  const [dateRange, setDateRange] = useState<DateRange>("This Week")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [corridorFilter, setCorridorFilter] = useState("All Corridors")
  const [search, setSearch] = useState("")

  const upcomingCards = SHIPMENTS.filter((s) => s.daysOut <= 14).slice(0, 3)

  const filteredList = useMemo(() => {
    return SHIPMENTS.filter((s) => {
      const matchSearch =
        search === "" ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.origin.toLowerCase().includes(search.toLowerCase()) ||
        s.destination.toLowerCase().includes(search.toLowerCase()) ||
        s.cargo.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        statusFilter === "All Status" ||
        STATUS_CONFIG[s.status].label === statusFilter
      const matchCorridor =
        corridorFilter === "All Corridors" || s.corridor === corridorFilter
      return matchSearch && matchStatus && matchCorridor
    })
  }, [search, statusFilter, corridorFilter])

  const stats = [
    {
      label: "Active Shipments",
      value: "12",
      sub: "+3 this week",
      icon: Activity,
      color: "text-[#00BCA8]",
      bg: "bg-[#00BCA8]/10",
    },
    {
      label: "In Transit",
      value: "8",
      sub: "Across 6 corridors",
      icon: Ship,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Proposed",
      value: "4",
      sub: "Awaiting approval",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "On-Time Rate",
      value: "94%",
      sub: "↑ 2% vs last month",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ]

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shipment operations &amp; trade route management
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <OrchestrateShipmentSheet />
          <CreateShipmentSheet />
        </div>
      </div>

      {/* ── Dense Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
        <Filter className="size-3.5 text-muted-foreground/60 shrink-0" />

        {/* Date range pills */}
        <div className="flex items-center gap-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDateRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                dateRange === r
                  ? "bg-[#00BCA8] text-black font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-4 opacity-50" />

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {statusFilter}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-36">
            {["All Status", ...Object.values(STATUS_CONFIG).map((c) => c.label)].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "font-semibold" : ""}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Corridor dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {corridorFilter}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {CORRIDORS.map((c) => (
              <DropdownMenuItem
                key={c}
                onClick={() => setCorridorFilter(c)}
                className={corridorFilter === c ? "font-semibold" : ""}
              >
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-4 opacity-50" />

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipments, routes, cargo…"
            className="h-7 pl-6 text-xs bg-transparent border-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 bg-card/60 hover:border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 font-mono">{stat.sub}</p>
                </div>
                <div className={`flex size-8 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Upcoming Shipment Cards ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[#00BCA8]" />
            <h2 className="text-sm font-semibold">Upcoming Shipments</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-mono">
              Next 14 days
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
            View all
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingCards.map((s) => (
            <UpcomingShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      </div>

      {/* ── Bottom Row: List + Chart + Quick List ────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Active shipments list - takes 2 cols */}
        <Card className="lg:col-span-2 border-border/60 bg-card/60">
          <CardHeader className="px-4 py-3 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package2 className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">All Shipments</CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-mono">
                  {filteredList.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-3">
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto] gap-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                <span>Route</span>
                <span className="text-right">ETA</span>
              </div>
              <Separator className="opacity-30" />
              {filteredList.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground/60">
                  No shipments match your filters
                </div>
              ) : (
                filteredList.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_auto] gap-2 items-center rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0">
                          {s.id}
                        </span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium truncate">
                        <span className="font-mono opacity-60">{s.originCode}</span>
                        <ArrowRight className="size-2.5 text-muted-foreground/40 shrink-0" />
                        <span className="font-mono opacity-60">{s.destinationCode}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="truncate">{s.cargo}</span>
                      </div>
                      {s.progress > 0 && (
                        <div className="mt-1">
                          <ProgressBar
                            value={s.progress}
                            color={
                              s.status === "in_transit"
                                ? "#00BCA8"
                                : s.status === "loading"
                                ? "#F59E0B"
                                : "#EF4444"
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium">{s.eta.split(",")[0]}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono">
                        {s.daysOut === 0 ? "Today" : s.daysOut === 1 ? "Tomorrow" : `${s.daysOut}d`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="px-4 py-3 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm">Distribution</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{dateRange}</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <DonutChart data={PIE_DATA} />
          </CardContent>
        </Card>

        {/* Quick Actions / Alert List */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="px-4 py-3 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <CardTitle className="text-sm">Needs Attention</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Action required</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1.5">
            {[
              {
                id: "SHP-2026-0129",
                msg: "Delayed at Port of Rotterdam",
                sub: "Expected delay: 2 days",
                color: "text-red-400",
                bg: "bg-red-400/10",
                dot: "bg-red-400",
                icon: AlertTriangle,
              },
              {
                id: "SHP-2026-0139",
                msg: "Awaiting carrier booking",
                sub: "Tokyo → Seattle",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                dot: "bg-purple-400",
                icon: FileText,
              },
              {
                id: "SHP-2026-0137",
                msg: "Customs docs incomplete",
                sub: "Mumbai → London",
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                dot: "bg-amber-400",
                icon: FileText,
              },
              {
                id: "SHP-2026-0131",
                msg: "Approaching delivery window",
                sub: "ETA: Mar 16 (3 days)",
                color: "text-[#00BCA8]",
                bg: "bg-[#00BCA8]/10",
                dot: "bg-[#00BCA8]",
                icon: CheckCircle2,
              },
              {
                id: "SHP-2026-0142",
                msg: "Insurance renewal due",
                sub: "Expires Mar 20",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                dot: "bg-blue-400",
                icon: Ship,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ${item.bg}`}>
                  <item.icon className={`size-3 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-tight">{item.msg}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                    {item.id} · {item.sub}
                  </p>
                </div>
              </div>
            ))}

            <Separator className="opacity-30 my-1" />

            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground hover:text-foreground justify-between"
            >
              View all alerts
              <ArrowRight className="size-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

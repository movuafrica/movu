"use client"

import type { ElementType } from "react"
import {
  Ship,
  Clock,
  Anchor,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Package2,
  Mail,
  Phone,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

import type { Shipment, ShipmentStatus } from "@/lib/demo-data"

interface ShipmentDetailSheetProps {
  shipment: Shipment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

type DocStatus = "Filed" | "Draft" | "In Review" | "Pending"

function getDocStatus(status: ShipmentStatus, docType: string): DocStatus {
  if (docType === "Customs Entry") {
    if (status === "delivered") return "Filed"
    if (status === "in_transit" || status === "delayed") return "In Review"
    return "Pending"
  }
  // Bill of Lading, Packing List, Certificate of Origin
  if (status === "in_transit" || status === "delivered" || status === "delayed") return "Filed"
  if (status === "loading" || status === "scheduled") return "Draft"
  return "Pending"
}

const DOC_STATUS_STYLES: Record<DocStatus, string> = {
  Filed: "text-green-400 bg-green-400/10 border-green-400/30",
  Draft: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "In Review": "text-blue-500 bg-blue-500/10 border-blue-500/30",
  Pending: "text-slate-400 bg-slate-400/10 border-slate-400/30",
}

const DOCUMENT_TYPES = [
  "Bill of Lading",
  "Packing List",
  "Certificate of Origin",
  "Customs Entry",
]

export function ShipmentDetailSheet({ shipment, open, onOpenChange }: ShipmentDetailSheetProps) {
  if (!shipment) return null

  const cfg = STATUS_CONFIG[shipment.status]
  const StatusIcon = cfg.icon

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[760px] flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="font-mono text-base">{shipment.id}</SheetTitle>
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
                <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium tabular-nums">
                  {shipment.value}
                </span>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                {shipment.origin} → {shipment.destination}
                {shipment.carrier !== "—" && (
                  <>
                    {" · "}
                    {shipment.carrier}
                  </>
                )}
                {shipment.vessel !== "—" && (
                  <>
                    {" · "}
                    <span className="italic">{shipment.vessel}</span>
                  </>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {/* Tabs — scrollable body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="timeline" className="flex-1 overflow-hidden flex flex-col gap-0">
            <TabsList className="rounded-none border-b border-border/60 bg-transparent h-auto px-6 py-0 justify-start gap-0 w-full">
              {["timeline", "cargo", "documents", "contacts"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={cn(
                    "rounded-none border-b-2 border-transparent px-4 py-3 text-sm capitalize",
                    "data-[state=active]:border-[#00BCA8] data-[state=active]:text-[#00BCA8] data-[state=active]:bg-transparent",
                    "data-[state=active]:shadow-none"
                  )}
                >
                  {tab === "timeline" ? "Timeline" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              <div className="relative">
                {shipment.milestones.map((milestone, idx) => {
                  const isLast = idx === shipment.milestones.length - 1
                  return (
                    <div key={idx} className="relative flex gap-4">
                      {/* Vertical connector line */}
                      {!isLast && (
                        <div
                          className={cn(
                            "absolute left-[11px] top-6 w-0.5 bottom-0",
                            milestone.done ? "bg-[#00BCA8]/40" : "bg-slate-200 dark:bg-slate-700"
                          )}
                          style={{ height: "calc(100% - 8px)" }}
                        />
                      )}

                      {/* Circle indicator */}
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {milestone.done ? (
                          <div className="size-6 rounded-full bg-[#00BCA8] flex items-center justify-center">
                            <CheckCircle2 className="size-3.5 text-white" />
                          </div>
                        ) : milestone.active ? (
                          <div className="size-6 rounded-full border-2 border-blue-500 flex items-center justify-center relative">
                            <div className="size-2 rounded-full bg-blue-500" />
                            <span className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-40" />
                          </div>
                        ) : (
                          <div className="size-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "text-sm",
                              milestone.done
                                ? "font-medium text-foreground"
                                : milestone.active
                                  ? "font-semibold text-blue-500"
                                  : "text-muted-foreground"
                            )}
                          >
                            {milestone.label}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {milestone.timestamp}
                          </span>
                        </div>
                        {milestone.note && (
                          <p className="text-xs text-muted-foreground mt-1">{milestone.note}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Cargo Tab */}
            <TabsContent value="cargo" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              <div className="flex flex-col gap-5">
                {/* Meta chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-mono font-medium">
                    HS {shipment.hsCode}
                  </span>
                  <span className="rounded-md border border-[#00BCA8]/30 bg-[#00BCA8]/10 text-[#00BCA8] px-2.5 py-1 text-xs font-medium">
                    {shipment.incoterms}
                  </span>
                </div>

                {/* Consignee */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 flex flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Consignee
                  </p>
                  <p className="text-sm font-medium">{shipment.consignee}</p>
                  {shipment.broker !== "—" && (
                    <p className="text-xs text-muted-foreground">
                      Broker: {shipment.broker}
                    </p>
                  )}
                  {shipment.blNumber !== "—" && (
                    <p className="text-xs text-muted-foreground font-mono">
                      B/L: {shipment.blNumber}
                    </p>
                  )}
                </div>

                {/* Packing list */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Packing List
                  </p>
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    {shipment.packingList.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm",
                          idx < shipment.packingList.length - 1 && "border-b border-border/40"
                        )}
                      >
                        <Package2 className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weight total */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Total Weight</span>
                  <span className="font-medium tabular-nums">{shipment.weight}</span>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              <div className="rounded-lg border border-border/60 overflow-hidden">
                {DOCUMENT_TYPES.map((docType, idx) => {
                  const status = getDocStatus(shipment.status, docType)
                  const isPending = status === "Pending"
                  return (
                    <div
                      key={docType}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3",
                        idx < DOCUMENT_TYPES.length - 1 && "border-b border-border/40"
                      )}
                    >
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm font-medium">{docType}</span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-medium",
                          DOC_STATUS_STYLES[status]
                        )}
                      >
                        {status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        className="h-7 text-xs border-border/60"
                      >
                        Download
                      </Button>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shipment.contacts.map((contact, idx) => {
                  const unassigned = contact.name === "—"
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border/60 bg-muted/10 p-4 flex flex-col gap-2"
                    >
                      {/* Role badge */}
                      <span className="w-fit rounded-full border border-[#00BCA8]/40 text-[#00BCA8] px-2 py-0.5 text-xs font-medium">
                        {contact.role}
                      </span>

                      {unassigned ? (
                        <p className="text-sm text-muted-foreground italic">
                          Not yet assigned
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-semibold">{contact.name}</p>
                          {contact.company !== "—" && (
                            <p className="text-xs text-muted-foreground">{contact.company}</p>
                          )}
                          <div className="flex flex-col gap-1 mt-0.5">
                            {contact.email !== "—" && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Mail className="size-3 shrink-0" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone !== "—" && (
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="size-3 shrink-0" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-border/60 px-6 py-4">
          <Button
            className="w-full bg-[#00BCA8] hover:bg-[#00BCA8]/90 text-white gap-2"
            onClick={() => console.log("Plan next shipment:", shipment.id)}
          >
            Plan Next Shipment →
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

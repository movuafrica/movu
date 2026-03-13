"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  Bot,
  CheckCircle2,
  ArrowRight,
  Package2,
  MapPin,
  Scale,
  Anchor,
  FileText,
  Clock,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string
  role: "ai" | "user"
  content: string
  type?: "text" | "manifest"
}

// ─── Demo Seed Conversation ───────────────────────────────────────────────────

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "ai",
    type: "text",
    content:
      "Hi there! I'm your AI export planning assistant. Tell me about the order you just received — what product are you shipping, how much of it, and where does it need to go?",
  },
  {
    id: "2",
    role: "user",
    type: "text",
    content:
      "I just received an order for 500 units of ceramic floor tiles. My customer is in Hamburg, Germany. I'm based in Lagos, Nigeria.",
  },
  {
    id: "3",
    role: "ai",
    type: "text",
    content:
      "Thanks — let's get your manifest started. A few quick questions:\n\n1. What's the approximate total weight of the 500 units?\n2. Does your customer have a delivery deadline?\n3. Do you know the Incoterms you've agreed on? (e.g. FOB, CIF) — it's okay if you're not sure yet.",
  },
  {
    id: "4",
    role: "user",
    type: "text",
    content:
      "Not sure about Incoterms. The tiles weigh about 2.5 tonnes in total. Customer needs delivery within 6 weeks.",
  },
  {
    id: "5",
    role: "ai",
    type: "text",
    content:
      "Perfect — I have everything I need. Here's what I've worked out:\n\nHS Code 6907.21 — Ceramic floor tiles, unglazed. Not classified as dangerous goods.\n\nRecommended Incoterms: FOB Lagos (Apapa Port). You arrange export to the port and clear customs on your end; your customer takes responsibility once the goods are loaded. This is the most common setup for first-time exporters.\n\nRoute: Apapa Port, Lagos → Port of Hamburg. Estimated sea transit 18–22 days — your 6-week deadline is comfortably achievable.\n\nI've drafted your preliminary manifest below. Review it and let me know if anything needs adjusting.",
  },
  {
    id: "6",
    role: "ai",
    type: "manifest",
    content: "",
  },
]

const FOLLOWUP_RESPONSES = [
  "I've noted your corrections. Once you confirm the manifest is accurate, I can generate your full commercial invoice, packing list, and certificate of origin — and suggest available carriers on the Lagos → Hamburg route. Ready to proceed?",
  "Great — your export documents are queued. I'll now recommend 3 carrier options on this corridor based on your timeline and cargo type. Would you like ocean freight only, or should I also include air freight alternatives?",
  "Understood. I'll flag this shipment for carrier selection. You can track its progress from the dashboard once a booking is confirmed.",
]

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = ["Order Details", "Cargo", "Route", "Manifest", "Book"]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto shrink-0">
      {STEPS.map((label, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={label} className="flex items-center gap-1 shrink-0">
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                done
                  ? "text-[#00BCA8] bg-[#00BCA8]/10 border border-[#00BCA8]/20"
                  : active
                  ? "text-foreground bg-muted border border-border"
                  : "text-muted-foreground/40"
              }`}
            >
              {done ? (
                <CheckCircle2 className="size-2.5 shrink-0" />
              ) : (
                <span className="size-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">
                  {i + 1}
                </span>
              )}
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="size-2.5 text-muted-foreground/25 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Manifest Card ────────────────────────────────────────────────────────────

function ManifestCard() {
  const fields = [
    { icon: MapPin, label: "Exporter", value: "Your Company · Lagos, NG" },
    { icon: MapPin, label: "Consignee", value: "Customer · Hamburg, DE" },
    { icon: Package2, label: "HS Code", value: "6907.21 — Ceramic floor tiles, unglazed" },
    { icon: Scale, label: "Weight / Vol.", value: "2,500 kg · ~18 CBM (est.)" },
    { icon: FileText, label: "Incoterms", value: "FOB Lagos (Apapa Port)" },
    { icon: Anchor, label: "Carrier Route", value: "Apapa → Hamburg · 18–22 days" },
    { icon: Clock, label: "Est. Departure", value: "Within 5 business days" },
  ]

  return (
    <div className="rounded-xl border border-[#00BCA8]/30 bg-[#00BCA8]/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#00BCA8]/20">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-[#00BCA8]" />
          <span className="text-xs font-semibold text-[#00BCA8] font-mono tracking-wide">
            MANIFEST DRAFT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 h-4 font-mono bg-slate-500/10 text-slate-400 border border-slate-400/20"
          >
            DRAFT
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground/60">MAN-DRAFT-0001</span>
        </div>
      </div>

      {/* Fields */}
      <div className="px-3 py-2 space-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-start gap-2 text-xs">
            <f.icon className="size-3 mt-0.5 text-muted-foreground/50 shrink-0" />
            <span className="text-muted-foreground/70 w-20 shrink-0">{f.label}</span>
            <span className="font-mono text-foreground/90 font-medium">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 border-t border-[#00BCA8]/20 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs border-border/60"
        >
          Edit Details
        </Button>
        <Button
          size="sm"
          className="flex-1 h-7 text-xs bg-[#00BCA8] hover:bg-[#00a894] text-black font-semibold"
        >
          Confirm &amp; Plan Route
          <ArrowRight className="size-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai"

  if (message.type === "manifest") {
    return (
      <div className="flex items-start gap-2.5">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00BCA8]/15 border border-[#00BCA8]/25 mt-0.5">
          <Bot className="size-3.5 text-[#00BCA8]" />
        </div>
        <div className="flex-1 min-w-0">
          <ManifestCard />
        </div>
      </div>
    )
  }

  if (isAi) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00BCA8]/15 border border-[#00BCA8]/25 mt-0.5">
          <Bot className="size-3.5 text-[#00BCA8]" />
        </div>
        <div className="flex-1 min-w-0 rounded-xl rounded-tl-sm bg-muted/40 border border-border/40 px-3 py-2.5">
          <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-end gap-2.5">
      <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-[#00BCA8]/15 border border-[#00BCA8]/25 px-3 py-2.5">
        <p className="text-xs text-foreground/90 leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00BCA8]/15 border border-[#00BCA8]/25">
        <Bot className="size-3.5 text-[#00BCA8]" />
      </div>
      <div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-muted/40 border border-border/40 px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrchestrateShipmentSheet() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(3)
  const [followupIdx, setFollowupIdx] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      type: "text",
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response =
        FOLLOWUP_RESPONSES[followupIdx] ??
        "I'm processing your request. In production, this connects to a live AI model."
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        type: "text",
        content: response,
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
      setFollowupIdx((prev) => prev + 1)
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }, 1200 + Math.random() * 600)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 bg-[#00BCA8] hover:bg-[#00a894] text-black font-semibold"
        >
          <Sparkles className="size-4" />
          Plan Shipment
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[900px] gap-0 p-0 bg-background border-l border-border/60"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#00BCA8]/10 border border-[#00BCA8]/20">
            <Sparkles className="size-4 text-[#00BCA8]" />
          </div>
          <div>
            <p className="text-base font-semibold">AI Export Planner</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Describe your order and I'll guide you to a manifest
            </p>
          </div>
        </div>

        <Separator />
        <StepIndicator currentStep={step} />
        <Separator />

        {/* Messages — flex-1 so it fills remaining height */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Input bar */}
        <div className="px-4 py-3 flex items-center gap-2 shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your order or ask a question…"
            className="flex-1 text-sm h-9"
            disabled={isTyping}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-9 w-9 p-0 bg-[#00BCA8] hover:bg-[#00a894] text-black shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

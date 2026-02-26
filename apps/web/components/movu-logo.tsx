import { Inter } from "next/font/google"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({ subsets: ["latin"], weight: "700" })

export function MovuLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        inter.className,
        "text-4xl font-bold tracking-tight text-foreground",
        className
      )}
    >
      m<span className="text-brand">o</span>vu
    </span>
  )
}

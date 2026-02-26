"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <SunIcon className="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

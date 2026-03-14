"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Home,
  Settings,
  PackageSearch,
  Route,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
} from "@workspace/ui/components/sidebar"
import { MovuLogo } from "@/components/movu-logo"
import { NavUser } from "@/components/nav-user"

const navItems = [
  { title: "Dashboard",       url: "/",          icon: Home,          soon: false },
  { title: "Shipments",       url: "/shipments", icon: PackageSearch, soon: false },
  { title: "Trade Corridors", url: "/corridors", icon: Route,         soon: false },
  { title: "Analytics",       url: "/analytics", icon: BarChart3,     soon: true  },
  { title: "Settings",        url: "/settings",  icon: Settings,      soon: true  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent">
              <Link href="/">
                <MovuLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) =>
              item.soon ? (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={`${item.title} — coming soon`}
                    disabled
                    className="opacity-40 cursor-not-allowed"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

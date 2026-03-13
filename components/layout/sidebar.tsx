"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Shield, 
  Settings,
  LogOut,
  Slack
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", group: "main" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar", group: "main" },
  { href: "/dashboard/coordinations", icon: Users, label: "Coordinations", group: "main" },
  { href: "/dashboard/audit", icon: FileText, label: "Audit Log", group: "main" },
  { href: "/dashboard/data", icon: Shield, label: "Data & Permissions", group: "settings" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", group: "settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Call the backend logout endpoint with credentials to send/receive session cookie
      await fetch("https://api.coagent4u.com/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      // Redirect back to sign-in page regardless of API response
      window.location.href = "/signin"
    }
  }

  const mainItems = navItems.filter(item => item.group === "main")
  const settingsItems = navItems.filter(item => item.group === "settings")

  return (
    <aside className="w-60 h-screen bg-card border-r border-border/50 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">⚡</span>
          </div>
          <span className="text-lg font-semibold text-foreground">CoAgent4U</span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">AJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Alex Johnson</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary">Agent Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Main items */}
        <div>
          {mainItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:text-foreground hover:bg-primary/5"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Settings divider */}
        {settingsItems.length > 0 && (
          <>
            <div className="my-2 border-t border-border/50" />
            <div className="px-3 py-2 text-xs font-semibold text-foreground/50 uppercase tracking-wider">Settings</div>
            {settingsItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/60 hover:text-foreground hover:bg-primary/5"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <Slack className="w-4 h-4 text-foreground/60" />
          <span className="text-xs text-foreground/60 truncate">Acme Corp</span>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className="w-full justify-start text-foreground/60 hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 mr-2 flex-shrink-0 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
              <span className="truncate">Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

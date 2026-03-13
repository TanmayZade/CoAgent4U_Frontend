"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening"

  // Session guard: redirect unauthenticated users or those still pending registration
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("https://api.coagent4u.com/auth/session", {
          credentials: "include",
        })
        if (!res.ok) {
          window.location.replace("/signin")
          return
        }
        const data = await res.json()
        if (!data.authenticated) {
          window.location.replace("/signin")
        } else if (data.pendingRegistration === true) {
          window.location.replace("/onboarding")
        }
      } catch {
        window.location.replace("/signin")
      }
    }
    checkSession()
  }, [])

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

  return (
    <div className="min-h-screen bg-background">
        <Sidebar />
        
        {/* Main content */}
        <div className="ml-60">
          {/* Top bar */}
          <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-6 flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm">
                  <span className="text-foreground/60">{greeting}, </span>
                  <span className="font-semibold">Alex</span>
                  <span className="text-foreground/60">. Your agent handled </span>
                  <span className="text-primary font-semibold">3 requests</span>
                  <span className="text-foreground/60"> today.</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Agent Status */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-semibold text-primary">ACTIVE</span>
                </div>
                
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground/60 hover:text-foreground h-10 w-10"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-foreground/60 hover:text-destructive hover:bg-destructive/10 h-10 w-10 disabled:opacity-50"
                  title="Sign out"
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
  )
}

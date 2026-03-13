"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening"

  const handleLogout = async () => {
    // POST /auth/logout
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.push("/signin")
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
                  className="text-foreground/60 hover:text-destructive hover:bg-destructive/10 h-10 w-10"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
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

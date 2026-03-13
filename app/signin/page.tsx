"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Slack } from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import gsap from "gsap"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleSlackSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In production, this would call: GET /auth/slack/start
      // which redirects to Slack OAuth with proper PKCE flow
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/onboarding")
    } catch (err) {
      setError("Failed to connect with Slack. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <main ref={containerRef} className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Theme toggle - floating */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Subtle accent light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <span className="text-lg font-bold text-primary">⚡</span>
            </div>
            <span className="text-xl font-semibold text-foreground hidden sm:inline">CoAgent4U</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-foreground/60">Connect your personal agent with Slack</p>
        </div>

        {/* Sign In Card */}
        <div className="p-8 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Welcome Back</h2>
            <p className="text-sm text-foreground/60">
              Sign in with your Slack workspace to access CoAgent4U
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Slack Sign In Button */}
          <Button
            onClick={handleSlackSignIn}
            disabled={isLoading}
            size="lg"
            className="w-full font-semibold py-6 rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Slack className="w-5 h-5" />
                <span>Continue with Slack</span>
              </div>
            )}
          </Button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-foreground/50">
            <Shield className="w-4 h-4" />
            <span>Secure login via Slack OAuth</span>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-foreground/50 mt-8">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  )
}

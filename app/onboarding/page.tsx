"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Check, 
  ChevronRight, 
  Calendar, 
  Lock,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const steps = [
  { id: 1, title: "Choose Username", icon: "👤" },
  { id: 2, title: "Connect Calendar", icon: "📅" },
  { id: 3, title: "Complete", icon: "✅" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [isValidatingUsername, setIsValidatingUsername] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [gdprConsent, setGdprConsent] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const router = useRouter()

  // Validate username format: ^[a-zA-Z0-9_-]{3,32}$
  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError("")
      return false
    }
    const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/
    const isValid = usernameRegex.test(value)
    if (!isValid) {
      if (value.length < 3) {
        setUsernameError("Username must be at least 3 characters")
      } else if (value.length > 32) {
        setUsernameError("Username must be no more than 32 characters")
      } else {
        setUsernameError("Username can only contain letters, numbers, underscores, and hyphens")
      }
    } else {
      setUsernameError("")
    }
    return isValid
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    validateUsername(value)
  }

  const handleUsernameSubmit = async () => {
    if (!validateUsername(username)) return

    setIsValidatingUsername(true)
    try {
      // POST /auth/username
      // { "username": "string" }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsValidatingUsername(false)
      setCurrentStep(2)
    } catch (err) {
      setUsernameError("This username is already taken. Try another.")
      setIsValidatingUsername(false)
    }
  }

  const handleConnectCalendar = async () => {
    setIsConnecting(true)
    try {
      // GET /integrations/google/authorize
      // Redirects to Google OAuth, then back to onboarding
      // GET /integrations/google/status returns { service: "GOOGLE_CALENDAR", connected: boolean }
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsConnecting(false)
      setCalendarConnected(true)
      setCurrentStep(3)
    } catch (err) {
      setIsConnecting(false)
    }
  }

  const handleComplete = () => {
    // POST /auth/logout or just redirect to dashboard
    // GET /auth/session should return authenticated: true, pendingRegistration: false
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-12">
      {/* Theme toggle - floating */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      {/* Subtle accent light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <span className="text-lg font-bold text-primary">⚡</span>
            </div>
            <span className="text-xl font-semibold text-foreground">CoAgent4U</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Setup</h1>
          <p className="text-foreground/60">Get your personal agent ready in just a few steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg border-2 transition-all",
                    step.id < currentStep
                      ? "bg-primary/10 border-primary text-primary"
                      : step.id === currentStep
                      ? "bg-primary border-primary text-background"
                      : "bg-background border-border text-foreground/40"
                  )}
                >
                  {step.id < currentStep ? <Check className="w-6 h-6" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-colors",
                      step.id < currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-2">{step.title}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8">
          {/* Step 1: Username */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Username</h2>
              <p className="text-foreground/60 mb-6">
                This is how other users will find and contact your agent
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="text-sm font-medium text-foreground mb-2 block">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="john-agent"
                    value={username}
                    onChange={handleUsernameChange}
                    disabled={isValidatingUsername}
                    className={cn(
                      "h-11 rounded-lg",
                      usernameError && "border-destructive/50 focus-visible:ring-destructive/50"
                    )}
                  />
                  {usernameError && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      {usernameError}
                    </p>
                  )}
                  <p className="text-xs text-foreground/50 mt-2">
                    3-32 characters. Letters, numbers, underscores, and hyphens only.
                  </p>
                </div>

                <Button
                  onClick={handleUsernameSubmit}
                  disabled={!username || usernameError !== "" || isValidatingUsername}
                  size="lg"
                  className="w-full font-semibold py-6 rounded-lg"
                >
                  {isValidatingUsername ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Google Calendar */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Connect Google Calendar</h2>
              <p className="text-foreground/60 mb-6">
                Allow your agent to read and create calendar events on your behalf
              </p>

              {/* Permissions breakdown */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Requested Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">calendar.readonly</p>
                      <p className="text-xs text-foreground/50">
                        View your calendar availability and events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">calendar.events</p>
                      <p className="text-xs text-foreground/50">
                        Create and modify events (with your approval)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data storage notice */}
              <div className="flex items-start gap-3 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/70">
                  We store only refresh tokens for calendar access. No calendar data is stored on our servers.
                </p>
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start gap-3 mb-8">
                <Checkbox
                  id="gdpr"
                  checked={gdprConsent}
                  onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="gdpr"
                  className="text-sm text-foreground/70 cursor-pointer leading-relaxed"
                >
                  I consent to CoAgent4U processing my calendar data in accordance with the{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                onClick={handleConnectCalendar}
                disabled={!gdprConsent || isConnecting}
                size="lg"
                className="w-full font-semibold py-6 rounded-lg mb-3"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Connect Google Calendar</span>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
                size="lg"
                className="w-full font-semibold py-6 rounded-lg"
              >
                Skip for Now
              </Button>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center py-6">
              {/* Celebration animation */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-8 h-8 text-background" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">All Set!</h2>
              <p className="text-foreground/60 mb-8 max-w-sm mx-auto">
                Your personal agent is now live and ready to help manage your schedule through Slack.
              </p>

              {/* Status checklist */}
              <div className="bg-muted/30 rounded-lg p-6 border border-border/50 mb-8 text-left inline-block max-w-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Username set</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-3",
                    calendarConnected ? "text-foreground" : "text-foreground/40"
                  )}>
                    {calendarConnected ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-border" />
                    )}
                    <span className="text-sm font-medium">Calendar connected</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://slack.com', '_blank')}
                  size="lg"
                  className="font-semibold py-6 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Slack
                </Button>
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="flex-1 font-semibold py-6 rounded-lg"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

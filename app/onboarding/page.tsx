"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  ChevronRight, 
  Calendar, 
  Lock,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

const steps = [
  { id: 1, title: "Slack Connected", description: "Your Slack identity verified" },
  { id: 2, title: "Connect Calendar", description: "Link your Google Calendar" },
  { id: 3, title: "Agent Ready", description: "Your agent is live" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleConnectCalendar = async () => {
    setIsConnecting(true)
    // Simulate connecting to Google Calendar
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnecting(false)
    setCurrentStep(3)
  }

  const handleComplete = () => {
    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  return (
    <main ref={containerRef} className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Deep charcoal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Glassmorphic glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Electric blue - top right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)",
          }}
        />
        {/* Navy - bottom left */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, #1E40AF 0%, transparent 70%)",
          }}
        />
      </div>

      <div ref={contentRef} className="relative z-10 w-full max-w-2xl mx-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center group-hover:border-cyan-400/60 transition-colors backdrop-blur-sm">
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">⚡</span>
            </div>
            <span className="text-xl font-semibold text-slate-100">CoAgent4U</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Complete Your Setup</h1>
          <p className="text-slate-400">Get your scheduling agent live in 3 quick steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-10 px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg border-2 transition-all backdrop-blur-sm",
                    step.id < currentStep
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : step.id === currentStep
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/50"
                      : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >
                  {step.id < currentStep ? <Check className="w-6 h-6" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all backdrop-blur-sm",
                      step.id < currentStep ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-white/10"
                    )}
                  />
                )}
              </div>
              <p className="text-sm font-medium text-slate-300 mt-2">{step.title}</p>
              <p className="text-xs text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Step Content - Glassmorphic Card */}
        <div className="p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl">
          {/* Step 1: Slack Connected */}
          {currentStep === 1 && (
            <div className="text-center">
              {/* Verified checkmark animation */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/40 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Check className="w-10 h-10 text-slate-950" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-50 mb-2">Slack Connected</h2>
              <p className="text-slate-400 mb-6">Your Slack workspace identity has been verified</p>

              {/* User info card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-200">AJ</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-50">Alex Johnson</p>
                    <p className="text-sm text-slate-400 font-mono">@alex.johnson</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-mono pt-4 border-t border-white/10">
                  Workspace: Acme Corp
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full font-semibold py-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                Continue Setup
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Connect Google Calendar */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-8 h-8 text-cyan-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-50 mb-2">Connect Google Calendar</h2>
                <p className="text-slate-400">Allow your agent to manage your schedule</p>
              </div>

              {/* Permissions card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 mb-6">
                <h3 className="text-sm font-semibold text-slate-50 mb-4">Required Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Read Calendar</p>
                      <p className="text-xs text-slate-500">View your availability and events</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Create Events</p>
                      <p className="text-xs text-slate-500">Schedule meetings with your approval</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 mb-8 p-3 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-400/30">
                <Lock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-cyan-300">
                  Only refresh tokens are stored. Your calendar data never touches our servers.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConnectCalendar}
                  disabled={isConnecting}
                  className="flex-1 font-semibold py-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Connect Calendar</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1 font-semibold py-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-200 backdrop-blur-sm"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Agent Ready */}
          {currentStep === 3 && (
            <div className="text-center">
              {/* Celebration animation */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/40 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Sparkles className="w-12 h-12 text-slate-950" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              <h2 className="text-2xl font-bold text-slate-50 mb-2">Your Agent is Live</h2>
              <p className="text-slate-400 mb-8">Start scheduling through Slack right away</p>

              {/* Agent status visualization */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 mb-8">
                <div className="flex items-center justify-center gap-8">
                  {/* Slack */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
                      <span className="text-sm font-bold text-slate-300">💬</span>
                    </div>
                    <span className="text-xs text-slate-400">Slack</span>
                  </div>

                  {/* Connection line */}
                  <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600" />

                  {/* Agent (center, larger) */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400 flex items-center justify-center mb-2 backdrop-blur-sm shadow-lg shadow-cyan-500/25">
                        <span className="text-xs font-bold text-cyan-300">Agent</span>
                      </div>
                      <div className="absolute -inset-1 rounded-full border border-cyan-400/50 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <span className="text-xs font-semibold text-cyan-400">ACTIVE</span>
                  </div>

                  {/* Connection line */}
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500" />

                  {/* Calendar */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
                      <span className="text-sm font-bold text-slate-300">📅</span>
                    </div>
                    <span className="text-xs text-slate-400">Calendar</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full font-semibold py-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                Go to Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

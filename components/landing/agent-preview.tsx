"use client"

import { Bot, Calendar, CheckCircle2 } from "lucide-react"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function AgentPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card scroll animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Agent Preview Card */}
        <div
          ref={cardRef}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/[0.08] overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-medium text-foreground ml-2">CoAgent4U</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Connected
              </div>
            </div>

            {/* Content - Slack-style message thread */}
            <div className="bg-zinc-900 p-4 lg:p-6 space-y-1">
              {/* User Message */}
              <div className="flex items-start gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  TZ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">Tanmay Zade</span>
                    <span className="text-zinc-500 text-xs">4:24 PM</span>
                  </div>
                  <p className="text-zinc-200 text-sm mt-0.5">
                    <span className="text-blue-400 hover:underline cursor-pointer">@CoAgent4U</span> schedule meeting with <span className="text-blue-400 hover:underline cursor-pointer">@Sarah</span> Friday afternoon
                  </p>
                </div>
              </div>

              {/* Agent Response */}
              <div className="flex items-start gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">CoAgent4U</span>
                    <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                    <span className="text-zinc-500 text-xs">4:24 PM</span>
                  </div>
                  <p className="text-zinc-200 text-sm mt-0.5">
                    Coordinating with Sarah&apos;s agent. Common availability found: 2:00 PM - 5:00 PM. Awaiting Sarah&apos;s approval before confirming.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Agent-to-agent coordination in progress
                  </div>
                </div>
              </div>

              {/* Meeting Approval Request */}
              <div className="flex items-start gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">CoAgent4U</span>
                    <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                    <span className="text-zinc-500 text-xs">4:25 PM</span>
                  </div>
                  {/* Slack attachment card */}
                  <div className="mt-2 border-l-4 border-amber-500 bg-zinc-800/60 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📋</span>
                      <h4 className="text-white font-semibold text-sm">Meeting Approval Request</h4>
                    </div>
                    <p className="text-zinc-300 text-sm mb-2">
                      <span className="text-blue-400">@Sarah</span> selected a meeting slot.
                    </p>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Fri, 14 Mar 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                      <span className="text-sm">🕐</span>
                      <span>03:00 PM - 04:00 PM</span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-3">Approve or reject this meeting time.</p>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors">
                        <span>✕</span>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Confirmed */}
              <div className="flex items-start gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">CoAgent4U</span>
                    <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                    <span className="text-zinc-500 text-xs">4:26 PM</span>
                  </div>
                  {/* Slack attachment card */}
                  <div className="mt-2 border-l-4 border-green-500 bg-zinc-800/60 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg text-green-500">✓</span>
                      <h4 className="text-white font-semibold text-sm">Meeting Confirmed</h4>
                    </div>
                    <p className="text-zinc-500 text-xs mb-1">Participants:</p>
                    <ul className="text-xs mb-2 space-y-0.5">
                      <li className="flex items-center gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                        <span className="text-blue-400">@Tanmay Zade</span>
                      </li>
                      <li className="flex items-center gap-2 text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                        <span className="text-blue-400">@Sarah</span>
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Fri, 14 Mar 2026</span>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                      See more
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

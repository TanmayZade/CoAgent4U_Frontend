"use client"

import { Bot, Calendar, CheckCircle2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"

export function AgentPreview() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const userMessageRef = useRef<HTMLDivElement>(null)
  const userTextRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const agentResponseRef = useRef<HTMLDivElement>(null)
  const approvalRequestRef = useRef<HTMLDivElement>(null)
  const approveButtonRef = useRef<HTMLButtonElement>(null)
  const meetingConfirmedRef = useRef<HTMLDivElement>(null)
  const [approveClicked, setApproveClicked] = useState(false)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    gsap.registerPlugin(ScrollTrigger, TextPlugin)

    const ctx = gsap.context(() => {
      // Card starts at 0.80 — grows to 1.0 as hero section exits (zoom-out = card getting bigger)
      gsap.set(cardRef.current, { scale: 0.80, transformOrigin: "center center" })

      // Hide all messages initially
      gsap.set(userMessageRef.current, { opacity: 0, y: 24 })
      gsap.set(agentResponseRef.current, { opacity: 0, y: 24 })
      gsap.set(approvalRequestRef.current, { opacity: 0, y: 24 })
      gsap.set(meetingConfirmedRef.current, { opacity: 0, y: 24 })
      gsap.set(cursorRef.current, { opacity: 0 })
      if (userTextRef.current) userTextRef.current.textContent = ""

      const USER_MSG = "@CoAgent4U schedule meeting with @Sarah Friday afternoon"

      // ── Zoom-out: card grows 0.80 → 1.0 as hero exits the viewport ──
      const heroEl = document.querySelector("[data-section='hero']") as HTMLElement
      if (heroEl) {
        gsap.to(cardRef.current, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: heroEl,
            start: "bottom 80%",
            end: "bottom top",
            scrub: true,
          },
        })
      }

      // ── Master timeline scrubbed to the pinned scroll section ──
      const tl = gsap.timeline({ paused: true })

      // Phase 1: user message (0 → 0.08)
      tl.to(userMessageRef.current, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0)

      // Cursor appears (0.08 → 0.10)
      tl.to(cursorRef.current, { opacity: 1, duration: 0.02 }, 0.08)

      // Typing (0.10 → 0.32)
      tl.to(
        userTextRef.current,
        { text: { value: USER_MSG, delimiter: "" }, duration: 0.22, ease: "none" },
        0.10
      )

      // Cursor hides (0.32 → 0.34)
      tl.to(cursorRef.current, { opacity: 0, duration: 0.02 }, 0.32)

      // Phase 2: agent response (0.36 → 0.44)
      tl.to(agentResponseRef.current, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.36)

      // Phase 3: approval request (0.48 → 0.56)
      tl.to(approvalRequestRef.current, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.48)

      // Simulate approve click (0.62 → 0.68)
      tl.to(approveButtonRef.current, { scale: 0.92, duration: 0.03 }, 0.62)
      tl.to(approveButtonRef.current, {
        scale: 1,
        duration: 0.03,
        onComplete: () => setApproveClicked(true),
      }, 0.65)

      // Phase 4: meeting confirmed (0.72 → 0.80)
      tl.to(meetingConfirmedRef.current, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.72)

      // Pin + scrub - lock state once completed
      let scrollTrigger: InstanceType<typeof ScrollTrigger> | null = null
      let animationCompleted = false

      scrollTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=120%",
        pin: stickyRef.current,
        onUpdate: (self) => {
          if (!animationCompleted) {
            // Play animation based on scroll progress
            tl.progress(self.progress)

            // Lock animation when fully complete (progress >= 0.8)
            if (self.progress >= 0.8) {
              animationCompleted = true
              tl.progress(1) // Set to final frame
              // Kill the scroll trigger to prevent reverse scroll
              self.disable()
              hasCompletedRef.current = true
            }
          }
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    // Outer section is 120vh so ScrollTrigger has scroll distance to work with
    // Animation completes at 80% progress, then scroll trigger is disabled
    <div ref={sectionRef} className="relative" style={{ height: "80vh" }}>
      {/* Sticky container — stays fixed while user scrolls through the 120vh */}
      <div ref={stickyRef} className="w-full py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-5xl mx-auto">
            <div ref={cardRef} className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/[0.08] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
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

              {/* Slack-style thread */}
              <div className="bg-background p-4 lg:p-6 space-y-1 min-h-[420px]">

                {/* User message */}
                <div
                  ref={userMessageRef}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    TZ
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground font-bold text-sm">Tanmay Zade</span>
                      <span className="text-muted-foreground text-xs">4:24 PM</span>
                    </div>
                    <p className="text-foreground text-sm mt-0.5 break-words">
                      <span ref={userTextRef} />
                      <span
                        ref={cursorRef}
                        className="inline-block w-[2px] h-[14px] bg-foreground align-middle ml-px"
                      />
                    </p>
                  </div>
                </div>

                {/* Agent response */}
                <div
                  ref={agentResponseRef}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground font-bold text-sm">CoAgent4U</span>
                      <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                      <span className="text-muted-foreground text-xs">4:24 PM</span>
                    </div>
                    <p className="text-foreground text-sm mt-0.5">
                      Coordinating with Sarah&apos;s agent. Common availability found: 2:00 PM – 5:00 PM. Awaiting Sarah&apos;s approval before confirming.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Agent-to-agent coordination in progress
                    </div>
                  </div>
                </div>

                {/* Meeting approval request */}
                <div
                  ref={approvalRequestRef}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground font-bold text-sm">CoAgent4U</span>
                      <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                      <span className="text-muted-foreground text-xs">4:25 PM</span>
                    </div>
                    <div className="mt-2 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">📋</span>
                        <h4 className="text-foreground font-semibold text-sm">Meeting Approval Request</h4>
                      </div>
                      <p className="text-foreground text-sm mb-2">
                        <span className="text-blue-600">@Sarah</span> selected a meeting slot.
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Fri, 14 Mar 2026</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                        <span>🕐</span>
                        <span>03:00 PM – 04:00 PM</span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-3">Approve or reject this meeting time.</p>
                      <div className="flex items-center gap-2">
                        <button
                          ref={approveButtonRef}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${approveClicked ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {approveClicked ? "Approved" : "Approve"}
                        </button>
                        <button
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${approveClicked ? "opacity-40 cursor-not-allowed bg-red-700" : "bg-red-600 hover:bg-red-700"
                            }`}
                          disabled={approveClicked}
                        >
                          <span>✕</span>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting confirmed */}
                <div
                  ref={meetingConfirmedRef}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground font-bold text-sm">CoAgent4U</span>
                      <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                      <span className="text-muted-foreground text-xs">4:26 PM</span>
                    </div>
                    <div className="mt-2 border-l-4 border-green-500 bg-green-50 rounded-r-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">✓</span>
                        <h4 className="text-foreground font-semibold text-sm">Meeting Confirmed</h4>
                      </div>
                      <p className="text-muted-foreground text-xs mb-1">Participants:</p>
                      <ul className="text-xs mb-2 space-y-0.5">
                        <li className="flex items-center gap-2 text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="text-blue-600">@Tanmay Zade</span>
                        </li>
                        <li className="flex items-center gap-2 text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="text-blue-600">@Sarah</span>
                        </li>
                      </ul>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Fri, 14 Mar 2026</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span>🕐</span>
                        <span>03:00 PM – 04:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

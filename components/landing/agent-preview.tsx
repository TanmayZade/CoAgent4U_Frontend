"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { Calendar, CheckCircle2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  SlackWindow,
  SlackMessage,
  SlackAttachment,
} from "./slack-ui"

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

  useEffect(() => {
    if (typeof window === "undefined") return
    gsap.registerPlugin(ScrollTrigger, TextPlugin)

    const ctx = gsap.context(() => {
      // Card starts at 0.80 — grows to 1.0 as hero section exits
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

      tl.to(userMessageRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0)
      tl.to(cursorRef.current, { opacity: 1, duration: 0.1 }, 0.4)
      tl.to(
        userTextRef.current,
        { text: { value: USER_MSG, delimiter: "" }, duration: 1.1, ease: "none" },
        0.5
      )
      tl.to(cursorRef.current, { opacity: 0, duration: 0.1 }, 1.6)
      tl.to(agentResponseRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.8)
      tl.to(approvalRequestRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 2.3)
      tl.to(approveButtonRef.current, { scale: 0.92, duration: 0.15 }, 3.0)
      tl.to(approveButtonRef.current, {
        scale: 1,
        duration: 0.15,
        onComplete: () => setApproveClicked(true),
      }, 3.15)
      tl.to(meetingConfirmedRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 3.6)

      tl.timeScale(0.4)

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        animation: tl,
        toggleActions: "play none none none",
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative">
      <div ref={stickyRef} className="w-full py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-[85rem] mx-auto">
            <SlackWindow ref={cardRef} channel="CoAgent4U" height="auto">
              {/* Slack-style thread content */}
              <div className="flex-1 space-y-1 min-h-[420px] transition-colors py-4 lg:py-6">
                
                {/* User message */}
                <SlackMessage
                  ref={userMessageRef}
                  sender="Tanmay Zade"
                  time="4:24 PM"
                  initials="TZ"
                >
                  <p className="text-zinc-700 text-sm mt-0.5 break-words">
                    <span ref={userTextRef} />
                    <span
                      ref={cursorRef}
                      className="inline-block w-[2px] h-[14px] bg-zinc-800 align-middle ml-px"
                    />
                  </p>
                </SlackMessage>

                {/* Agent response */}
                <SlackMessage
                  ref={agentResponseRef}
                  sender="CoAgent4U"
                  time="4:24 PM"
                  isApp
                >
                  <p className="text-zinc-700 text-sm mt-0.5">
                    Coordinating with Sarah&apos;s agent. Common availability found: 2:00 PM – 5:00 PM. Awaiting Sarah&apos;s approval before confirming.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Agent-to-Agent coordination in progress
                  </div>
                </SlackMessage>

                {/* Meeting approval request */}
                <SlackMessage
                  ref={approvalRequestRef}
                  sender="CoAgent4U"
                  time="4:25 PM"
                  isApp
                >
                  <SlackAttachment color="amber" emoji="📋" header="Meeting Approval Request">
                    <p className="text-zinc-600 text-sm mb-2">
                      <span className="text-blue-600">@Sarah</span> selected a meeting slot.
                    </p>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Fri, 14 Mar 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                      <span>🕐</span>
                      <span>03:00 PM – 04:00 PM</span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-3">Approve or reject this meeting time.</p>
                    <div className="flex items-center gap-2">
                      <button
                        ref={approveButtonRef}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${approveClicked ? "bg-green-700" : "bg-green-600 hover:bg-green-500"
                          }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {approveClicked ? "Approved" : "Approve"}
                      </button>
                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded transition-colors ${approveClicked ? "opacity-40 cursor-not-allowed bg-zinc-500" : "bg-red-600 hover:bg-red-500"
                          }`}
                        disabled={approveClicked}
                      >
                        <span>✕</span>
                        Reject
                      </button>
                    </div>
                  </SlackAttachment>
                </SlackMessage>

                {/* Meeting confirmed */}
                <SlackMessage
                  ref={meetingConfirmedRef}
                  sender="CoAgent4U"
                  time="4:26 PM"
                  isApp
                >
                  <SlackAttachment color="green" emoji="✓" header="Meeting Confirmed">
                    <p className="text-zinc-500 text-xs mb-1">Participants:</p>
                    <ul className="text-xs mb-2 space-y-0.5">
                      <li className="flex items-center gap-2 text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span className="text-blue-600">@Tanmay Zade</span>
                      </li>
                      <li className="flex items-center gap-2 text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span className="text-blue-600">@Sarah</span>
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Fri, 14 Mar 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <span>🕐</span>
                      <span>03:00 PM – 04:00 PM</span>
                    </div>
                  </SlackAttachment>
                </SlackMessage>

              </div>
            </SlackWindow>
          </div>
        </div>
      </div>
    </div>
  )
}

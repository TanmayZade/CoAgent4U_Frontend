"use client"

import { Calendar, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

// ── Types ────────────────────────────────────────────────────────────────────

type SlackMessage = {
  from: "user" | "agent"
  userName?: string     // override user name per-window
  userInitials?: string // override avatar initials per-window
  time: string
  text?: string
  attachment?: SlackAttachment
}

type SlackAttachment = {
  color: "amber" | "green" | "blue" | "red"
  header: string
  emoji: string
  body: React.ReactNode
}

// ── Slot pill helpers ─────────────────────────────────────────────────────────

const SLOTS = [
  "06:00 pm – 07:00 pm",
  "06:30 pm – 07:30 pm",
  "07:00 pm – 08:00 pm",
  "07:30 pm – 08:30 pm",
]

// Read-only slot pills (requestee view — preview only, no action)
function SlotPillsReadOnly() {
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {SLOTS.map((t, i) => (
        <button key={i} disabled className="px-2 py-1.5 text-[11px] bg-zinc-100 border border-zinc-300 rounded text-zinc-800 font-medium whitespace-nowrap cursor-default">
          {t}
        </button>
      ))}
      <button disabled className="px-2 py-1.5 text-[11px] bg-zinc-100 border border-zinc-300 rounded text-zinc-800 font-medium cursor-default">
        + 1 more
      </button>
    </div>
  )
}

// Clickable slot pills (invitee view)
function SlotPillsClickable() {
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {SLOTS.map((t, i) => (
        <button key={i} className="px-2 py-1.5 text-[11px] bg-zinc-100 border border-zinc-300 rounded hover:bg-zinc-200 transition-colors text-zinc-800 font-medium whitespace-nowrap">
          {t}
        </button>
      ))}
      <button className="px-2 py-1.5 text-[11px] bg-zinc-100 border border-zinc-300 rounded hover:bg-zinc-200 transition-colors text-zinc-800 font-medium">
        + 1 more
      </button>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const viewScheduleThread: SlackMessage[] = [
  { from: "user", time: "11:33 AM", text: "show my schedule" },
  {
    from: "agent", time: "11:33 AM",
    attachment: {
      color: "blue", emoji: "📅", header: "Your upcoming schedule (next 7 days):",
      body: (
        <ul className="mt-1 space-y-1 text-xs text-zinc-700">
          {[
            { name: "Team Standup",   date: "Mon, Mar 20", time: "09:00 am – 09:30 am" },
            { name: "Design Review",  date: "Mon, Mar 20", time: "10:30 am – 11:30 am" },
            { name: "Lunch with Alex",date: "Mon, Mar 20", time: "01:00 pm – 02:00 pm" },
            { name: "Sprint Planning",date: "Mon, Mar 20", time: "03:00 pm – 05:00 pm" },
            { name: "Team Lunch",     date: "Tue, Mar 21", time: "12:00 pm – 01:00 pm" },
          ].map((e, i) => (
            <li key={i} className="flex flex-col">
              <span className="font-semibold text-zinc-900">• {e.name}</span>
              <span className="pl-3 text-zinc-500">{e.date}, {e.time}</span>
            </li>
          ))}
          <li><button className="text-blue-600 mt-1 hover:underline text-xs">See less</button></li>
        </ul>
      ),
    },
  },
]

const addEventThread: SlackMessage[] = [
  { from: "user", time: "2:10 PM", text: "@CoAgent4U add team lunch next Tuesday at 12 pm" },
  { from: "agent", time: "2:10 PM", text: "Checking your calendar for Tuesday at 12:00 PM…" },
  {
    from: "agent", time: "2:10 PM",
    text: "No conflicts found. Here's the proposed event:",
    attachment: {
      color: "amber", emoji: "📋", header: "Event Approval Request",
      body: (
        <div className="mt-1 text-xs text-zinc-600 space-y-1">
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-zinc-400" /><span>Tue, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>12:00 pm – 01:00 pm</span></div>
          <div className="flex items-center gap-2"><span>📌</span><span className="font-semibold text-zinc-800">Team Lunch</span></div>
          <p className="text-zinc-500 mt-2">Approve or reject this event.</p>
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors">
              ✕ Reject
            </button>
          </div>
        </div>
      ),
    },
  },
  {
    from: "agent", time: "2:11 PM",
    attachment: {
      color: "green", emoji: "✅", header: "Event Created Successfully!",
      body: (
        <div className="mt-1 text-xs text-zinc-600 space-y-1">
          <div className="flex items-center gap-2"><span>📌</span><span className="font-semibold text-zinc-800">Team Lunch</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-zinc-400" /><span>Tue, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>12:00 pm – 01:00 pm</span></div>
        </div>
      ),
    },
  },
]

// ── Requestee thread (Tanmay's Slack DM with CoAgent4U) ────────────────────────
// Strictly mirrors the actual backend flow:
//   1. User sends command
//   2. Agent: Coordinating + Proposed Slots card (view-only pills)
//   3. After Sarah selects → Agent: Meeting Approval Request (Approve/Reject)
//   4. After Tanmay approves → Agent: Meeting Confirmed
const requesterThread: SlackMessage[] = [
  {
    from: "user",
    userName: "Tanmay Zade", userInitials: "TZ",
    time: "4:24 PM",
    text: "@CoAgent4U schedule meeting with @Sarah Friday evening",
  },
  {
    from: "agent", time: "4:24 PM",
    text: "Coordinating with Sarah's agent. Common availability found: 6:00 PM – 8:00 PM. Awaiting Sarah's selection.",
  },
  {
    from: "agent", time: "4:24 PM",
    attachment: {
      color: "blue", emoji: "📅", header: "Proposed Slots",
      body: (
        <div className="text-xs text-zinc-600">
          <p className="mb-2">I&apos;ve proposed these available time slots to <span className="text-blue-600">@Sarah</span>. Waiting for their selection...</p>
          <div className="flex items-center gap-1 mb-1">
            <span>🗓️</span><span className="font-semibold text-zinc-800">Fri, Mar 21, 2026</span>
          </div>
          <SlotPillsReadOnly />
          <button className="text-blue-600 mt-2 hover:underline text-xs">See less</button>
        </div>
      ),
    },
  },
  {
    from: "agent", time: "4:35 PM",
    attachment: {
      color: "amber", emoji: "📋", header: "Meeting Approval Request",
      body: (
        <div className="text-xs text-zinc-600 space-y-1">
          <p><span className="text-blue-600">@Sarah</span> selected a meeting slot.</p>
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-zinc-400" /><span>Fri, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>06:30 pm – 07:30 pm</span></div>
          <p className="text-zinc-500 mt-1">Approve or reject this meeting time.</p>
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors">
              ✕ Reject
            </button>
          </div>
        </div>
      ),
    },
  },
  {
    from: "agent", time: "4:35 PM",
    attachment: {
      color: "green", emoji: "✓", header: "Meeting Confirmed",
      body: (
        <div className="text-xs text-zinc-600 space-y-1">
          <p className="text-zinc-500">Participants:</p>
          <ul className="space-y-0.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" /><span className="text-blue-600">@Tanmay Zade</span></li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" /><span className="text-blue-600">@Sarah</span></li>
          </ul>
          <div className="flex items-center gap-2 mt-1"><Calendar className="w-3.5 h-3.5 text-zinc-400" /><span>Fri, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>06:30 pm – 07:30 pm</span></div>
        </div>
      ),
    },
  },
]

// ── Invitee thread (Sarah's Slack DM with CoAgent4U) ─────────────────────────
// Strictly mirrors the actual backend flow:
//   1. Agent: "@Tanmay Zade invited you…" + Available Time Slots card (selectable pills + Reject)
//   2. After Sarah selects → Agent: Confirmation of selected slot
const inviteeThread: SlackMessage[] = [
  {
    from: "agent", time: "4:24 PM",
    text: "<@Tanmay Zade> invited you to a meeting.",
    attachment: {
      color: "blue", emoji: "📅", header: "Available Time Slots",
      body: (
        <div className="text-xs text-zinc-600">
          <p className="mb-2">Please select a suitable time slot:</p>
          <div className="flex items-center gap-1 mb-1">
            <span>🗓️</span><span className="font-semibold text-zinc-800">Fri, Mar 21, 2026</span>
          </div>
          <SlotPillsClickable />
          <button className="mt-3 flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors">
            Reject Meeting
          </button>
          <button className="text-blue-600 mt-2 hover:underline text-xs block">See less</button>
        </div>
      ),
    },
  },
  {
    from: "agent", time: "4:35 PM",
    attachment: {
      color: "blue", emoji: "🕐", header: "Selected Time Slot",
      body: (
        <div className="text-xs text-zinc-600 space-y-1">
          <div className="flex items-center gap-1 mb-1"><span>🗓️</span><span className="font-semibold text-zinc-800">Fri, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>06:30 pm – 07:30 pm</span></div>
          <p className="text-zinc-400 mt-1 text-[11px]">Selected at Fri, 20 Mar 2026 at 4:35 pm</p>
          <p className="text-zinc-600 mt-1">⏳ Waiting for approval...</p>
        </div>
      ),
    },
  },
  {
    from: "agent", time: "4:38 PM",
    attachment: {
      color: "green", emoji: "✅", header: "Meeting Confirmed!",
      body: (
        <div className="text-xs text-zinc-600 space-y-1">
          <p><span className="text-blue-600">@Tanmay Zade</span> approved the meeting.</p>
          <div className="flex items-center gap-2 mt-1"><Calendar className="w-3.5 h-3.5 text-zinc-400" /><span>Fri, Mar 21, 2026</span></div>
          <div className="flex items-center gap-2"><span>🕐</span><span>06:30 pm – 07:30 pm</span></div>
          <p className="text-zinc-500 mt-1">Both calendars have been updated. ✓</p>
        </div>
      ),
    },
  },
]

// ── Use case config ───────────────────────────────────────────────────────────

const useCases = [
  { id: "view",       label: "Show Schedule", thread: viewScheduleThread },
  { id: "add",        label: "Add Event",     thread: addEventThread },
  { id: "coordinate", label: "Coordinate",    thread: null }, // handled separately
]

// ── Attachment border colors ──────────────────────────────────────────────────
const borderColor: Record<string, string> = {
  amber: "border-amber-500",
  green: "border-green-500",
  blue:  "border-blue-500",
  red:   "border-red-500",
}

// ── SlackThread component ─────────────────────────────────────────────────────

function SlackThread({
  messages,
  userName = "Tanmay Zade",
  userInitials = "TZ",
}: {
  messages: SlackMessage[]
  userName?: string
  userInitials?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const canScrollUp = scrollTop > 0
      const canScrollDown = scrollTop + clientHeight < scrollHeight

      // If scrolling up and we can scroll up, or scrolling down and we can scroll down
      if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
        el.scrollTop += e.deltaY
        e.preventDefault()
        e.stopPropagation()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [])

  return (
    <div 
      ref={scrollRef}
      className="bg-white p-4 space-y-1 rounded-b-2xl flex-1" 
      style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}
    >
      {messages.map((msg, i) => {
        if (msg.from === "user") {
          const name     = msg.userName     ?? userName
          const initials = msg.userInitials ?? userInitials
          return (
            <div key={i} className="flex items-start gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-900 font-bold text-sm">{name}</span>
                  <span className="text-zinc-500 text-xs">{msg.time}</span>
                </div>
                <p className="text-zinc-700 text-sm mt-0.5">{msg.text}</p>
              </div>
            </div>
          )
        }

        const prevMsg    = messages[i - 1]
        const showHeader = !prevMsg || prevMsg.from !== "agent" ||
          (prevMsg.from === "agent" && prevMsg.time !== msg.time)

        return (
          <div key={i} className="flex items-start gap-3 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors">
            <div className="w-9 h-9 shrink-0">
              {showHeader ? (
                <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 flex items-center justify-center">
                  <Image src="/images/logo-light.png" alt="CoAgent4U" width={20} height={20} className="object-contain" />
                </div>
              ) : <div className="w-9 h-full" />}
            </div>
            <div className="flex-1 min-w-0">
              {showHeader && (
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-900 font-bold text-sm">CoAgent4U</span>
                  <span className="bg-zinc-200 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded font-medium">APP</span>
                  <span className="text-zinc-500 text-xs">{msg.time}</span>
                </div>
              )}
              {msg.text && <p className="text-zinc-700 text-sm mt-0.5">{msg.text}</p>}
              {msg.attachment && (
                <div className={`mt-2 border-l-4 ${borderColor[msg.attachment.color]} bg-zinc-50 rounded-r-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{msg.attachment.emoji}</span>
                    <h4 className="text-zinc-900 font-semibold text-sm">{msg.attachment.header}</h4>
                  </div>
                  {msg.attachment.body}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Slack Window wrapper ──────────────────────────────────────────────────────

function SlackWindow({
  channel,
  messages,
  userName,
  userInitials,
}: {
  channel: string
  messages: SlackMessage[]
  userName?: string
  userInitials?: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 shadow-lg shadow-black/[0.04] flex flex-col" style={{ height: '520px' }}>
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-zinc-700 text-sm font-medium ml-2">{channel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Live Preview
        </div>
      </div>
      <SlackThread messages={messages} userName={userName} userInitials={userInitials} />
    </div>
  )
}

// ── Main Section ──────────────────────────────────────────────────────────────

export function UseCaseExamples() {
  const [activeCase, setActiveCase]     = useState("view")
  const [coordinateView, setCoordinateView] = useState<"requester" | "invitee">("requester")

  const active = useCases.find((uc) => uc.id === activeCase)!

  return (
    <section id="use-cases" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Real Use Case Examples
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            See it in action
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple commands, powerful coordination. Walk through complete flows to see how agents work.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setActiveCase(uc.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCase === uc.id
                ? "bg-foreground text-background shadow-lg"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {uc.label}
            </button>
          ))}
        </div>

        {/* Single-window cases */}
        {activeCase !== "coordinate" && (
          <div className="max-w-2xl mx-auto">
            <SlackWindow
              key={activeCase}
              channel="# coagent4u-demo"
              messages={active.thread!}
            />
          </div>
        )}

        {/* Coordinate case — dual view with toggle */}
        {activeCase === "coordinate" && (
          <div className="max-w-2xl mx-auto">
            {/* Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
                <button
                  onClick={() => setCoordinateView("requester")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    coordinateView === "requester"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  👤 Tanmay&apos;s View
                </button>
                <button
                  onClick={() => setCoordinateView("invitee")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    coordinateView === "invitee"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  👤 Sarah&apos;s View
                </button>
              </div>
            </div>

            {/* Label */}
            <p className="text-center text-xs text-muted-foreground mb-4">
              {coordinateView === "requester"
                ? "Tanmay's Slack DM — what the requester sees"
                : "Sarah's Slack DM — what the invitee sees"}
            </p>

            {/* Slack window */}
            {coordinateView === "requester" ? (
              <SlackWindow
                key="requester"
                channel="# coagent4u (Tanmay Zade)"
                messages={requesterThread}
                userName="Tanmay Zade"
                userInitials="TZ"
              />
            ) : (
              <SlackWindow
                key="invitee"
                channel="# coagent4u (Sarah)"
                messages={inviteeThread}
                userName="Sarah"
                userInitials="SR"
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

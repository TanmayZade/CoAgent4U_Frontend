"use client"

import { useState } from "react"
import { X, CheckCircle2, Circle, AlertCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoordinationDetailDto } from "@/lib/api/coordinations"

// Color mapping for states
const stateColors: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  INITIATED:              { bg: "bg-blue-500/15",   border: "border-blue-400/40",   text: "text-blue-400",   icon: <Circle className="w-4 h-4" /> },
  CHECKING_AVAILABILITY_A:{ bg: "bg-cyan-500/15",   border: "border-cyan-400/40",   text: "text-cyan-400",   icon: <Clock className="w-4 h-4" /> },
  CHECKING_AVAILABILITY_B:{ bg: "bg-cyan-500/15",   border: "border-cyan-400/40",   text: "text-cyan-400",   icon: <Clock className="w-4 h-4" /> },
  MATCHING:               { bg: "bg-indigo-500/15", border: "border-indigo-400/40", text: "text-indigo-400", icon: <ArrowRight className="w-4 h-4" /> },
  PROPOSAL_GENERATED:     { bg: "bg-violet-500/15", border: "border-violet-400/40", text: "text-violet-400", icon: <CheckCircle2 className="w-4 h-4" /> },
  AWAITING_APPROVAL_B:    { bg: "bg-amber-500/15",  border: "border-amber-400/40",  text: "text-amber-400",  icon: <AlertCircle className="w-4 h-4" /> },
  AWAITING_APPROVAL_A:    { bg: "bg-amber-500/15",  border: "border-amber-400/40",  text: "text-amber-400",  icon: <AlertCircle className="w-4 h-4" /> },
  APPROVED_BY_BOTH:       { bg: "bg-emerald-500/15",border: "border-emerald-400/40",text: "text-emerald-400",icon: <CheckCircle2 className="w-4 h-4" /> },
  CREATING_EVENT_A:       { bg: "bg-teal-500/15",   border: "border-teal-400/40",   text: "text-teal-400",   icon: <Clock className="w-4 h-4" /> },
  CREATING_EVENT_B:       { bg: "bg-teal-500/15",   border: "border-teal-400/40",   text: "text-teal-400",   icon: <Clock className="w-4 h-4" /> },
  COMPLETED:              { bg: "bg-green-500/15",  border: "border-green-400/40",  text: "text-green-400",  icon: <CheckCircle2 className="w-4 h-4" /> },
  REJECTED:               { bg: "bg-red-500/15",    border: "border-red-400/40",    text: "text-red-400",    icon: <XCircle className="w-4 h-4" /> },
  FAILED:                 { bg: "bg-red-500/15",    border: "border-red-400/40",    text: "text-red-400",    icon: <XCircle className="w-4 h-4" /> },
}

const defaultColor = { bg: "bg-muted/20", border: "border-border/40", text: "text-foreground/60", icon: <Circle className="w-4 h-4" /> }

function humanizeState(state: string) {
  return state.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    .replace("Availability A", "Availability (You)")
    .replace("Availability B", "Availability (Them)")
    .replace("Approval A", "Your Approval")
    .replace("Approval B", "Their Approval")
    .replace("Event A", "Your Event")
    .replace("Event B", "Their Event")
}

interface Props {
  detail: CoordinationDetailDto
  onClose: () => void
  onCancel: () => Promise<void>
  onApprove: (approved: boolean) => Promise<void>
}

export function CoordinationDetailModal({ detail, onClose, onCancel, onApprove }: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const isTerminal = ["COMPLETED", "REJECTED", "FAILED"].includes(detail.state)
  const isAwaitingApproval = detail.state === "AWAITING_APPROVAL_A" || detail.state === "AWAITING_APPROVAL_B"

  // The other participant's info
  const otherName = detail.role === 'REQUESTER'
    ? (detail.inviteeDisplayName || detail.inviteeUsername)
    : (detail.requesterDisplayName || detail.requesterUsername)
  const otherAvatar = detail.role === 'REQUESTER'
    ? detail.inviteeAvatarUrl
    : detail.requesterAvatarUrl

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setActionLoading(action)
    try { await fn() } finally { setActionLoading(null) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/95 backdrop-blur-md rounded-t-2xl">
          <div className="flex items-center gap-3">
            {otherAvatar ? (
              <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                {otherName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-foreground">{detail.proposal?.title || "Coordination"}</h2>
              <p className="text-xs text-foreground/50">with {otherName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors text-foreground/50 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Proposal */}
        {detail.proposal && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{detail.proposal.title}</p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  {new Date(detail.proposal.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}{", "}
                  {new Date(detail.proposal.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  {" – "}
                  {new Date(detail.proposal.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {detail.proposal.durationMinutes} min
              </span>
            </div>
          </div>
        )}

        {/* Flow Timeline */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Coordination Flow</h3>
          <div className="relative">
            {detail.stateLog.map((entry, i) => {
              const colors = stateColors[entry.toState] || defaultColor
              const isLast = i === detail.stateLog.length - 1
              return (
                <div key={i} className="flex gap-3 mb-0">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text} shrink-0`}>
                      {colors.icon}
                    </div>
                    {!isLast && <div className="w-px h-8 bg-border/30" />}
                  </div>
                  {/* Content */}
                  <div className={`flex-grow pb-${isLast ? '0' : '3'}`}>
                    <p className={`text-sm font-medium ${colors.text}`}>
                      {humanizeState(entry.toState)}
                    </p>
                    {entry.reason && (
                      <p className="text-xs text-foreground/40 mt-0.5">{entry.reason}</p>
                    )}
                    <p className="text-[10px] text-foreground/30 mt-0.5">
                      {new Date(entry.transitionedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-border/30 bg-card/95 backdrop-blur-md rounded-b-2xl flex items-center gap-3">
          {/* Cancel — visible for non-terminal states */}
          {!isTerminal && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={actionLoading !== null}
              onClick={() => handleAction('cancel', onCancel)}
            >
              {actionLoading === 'cancel' ? 'Cancelling…' : 'Cancel Coordination'}
            </Button>
          )}

          {/* Approve/Reject — only when awaiting this user's approval */}
          {isAwaitingApproval && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                disabled={actionLoading !== null}
                onClick={() => handleAction('reject', () => onApprove(false))}
              >
                {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={actionLoading !== null}
                onClick={() => handleAction('approve', () => onApprove(true))}
              >
                {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
              </Button>
            </div>
          )}

          {/* Close — always visible */}
          {isTerminal && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

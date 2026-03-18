"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "../layout"
import { coordinationsAPI } from "@/lib/api/coordinations"
import { StatusChip } from "@/components/ui/status-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Calendar, Loader2 } from "lucide-react"

export default function CoordinationsPage() {
  const { user } = useUser()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ['coordinations', user?.username, page, statusFilter],
    queryFn: () => coordinationsAPI.getHistory(user!.username, page, 20, statusFilter),
    enabled: !!user?.username
  })

  // Basic client-side search across the current page results
  const filteredData = data?.content.filter((item: any) => 
    searchQuery === "" || 
    (item.meetingTitle && item.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.withUsername && item.withUsername.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "COMPLETED", label: "Completed" },
    { id: "PENDING", label: "Pending" }
  ]

  // Map PENDING to the actual states
  const handleTabClick = (tabId: string) => {
    if (tabId === "PENDING") {
      // In a real app, the backend should support a generic 'PENDING' status that maps to these
      setStatusFilter("PENDING") // Assuming backend supports this or client filters
    } else {
      setStatusFilter(tabId)
    }
    setPage(0)
  }

  // Fallback to match exactly what the user gave if PENDING mapped differently
  const displayData = filteredData?.filter(item => {
    if (statusFilter === "PENDING") {
      return !["COMPLETED", "REJECTED", "FAILED", "ALL"].includes(item.state)
    }
    if (statusFilter === "COMPLETED") {
      return item.state === "COMPLETED"
    }
    return true
  })

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
          Coordination Hub
        </h1>
        
        {/* Pill Filters */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                statusFilter === tab.id 
                  ? "bg-foreground text-background shadow-md" 
                  : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-foreground/50">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading coordinations...</p>
          </div>
        )}
        
        {!isLoading && displayData?.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-foreground/40 bg-muted/10 border border-dashed border-border/50 rounded-2xl">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No coordinations found matching the criteria.</p>
          </div>
        )}

        {!isLoading && displayData && displayData.length > 0 && (
          <div className="flex flex-col gap-4">
            {displayData.map((coord: any) => (
              <div 
                key={coord.coordinationId} 
                className="flex items-center gap-6 p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:border-foreground/20 transition-colors"
              >
                {/* Left: Avatar & Name */}
                <div className="flex flex-col items-center justify-center min-w[80px] w-20 shrink-0 border-r border-border/20 pr-6">
                  <div className="w-14 h-14 rounded-full border-2 border-foreground/20 bg-muted flex items-center justify-center overflow-hidden mb-2">
                    {coord.withUsername ? (
                      <span className="text-lg font-semibold text-foreground/70">
                        {coord.withUsername.substring(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-6 h-6 text-foreground/40" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground/80 text-center truncate w-full">
                    {coord.withUsername || "Unknown"}
                  </span>
                </div>

                {/* Center: Details */}
                <div className="flex-grow py-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-foreground">
                      {coord.meetingTitle || "Active Sync Session"}
                    </h3>
                    <StatusChip state={coord.state} />
                  </div>
                  
                  <div className="flex items-center text-sm text-foreground/60 font-medium tracking-tight">
                    {coord.meetingTime 
                      ? (() => {
                          const dt = new Date(coord.meetingTime)
                          const datePart = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          const timePart = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                          return `${datePart}, ${timePart}`
                        })()
                      : "Pending Time"
                    }
                  </div>
                </div>

                {/* Right: Empty for now (View Detailed Status removed per instruction) */}
                <div className="shrink-0 w-32">
                  {/* Reserved space to maintain layout balance, matching mockup right-side alignment without the button */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination (Minimal B&W Style) */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-border/30 flex items-center justify-between text-sm text-foreground/60">
          <div>
            Showing {page * 20 + 1}-{Math.min((page + 1) * 20, data.totalElements)} of {data.totalElements}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3" 
              disabled={data.isFirst}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="px-2 text-foreground font-medium">
              {page + 1} / {data.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3" 
              disabled={data.isLast}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

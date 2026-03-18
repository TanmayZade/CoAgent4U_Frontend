"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "../layout"
import { coordinationsAPI } from "@/lib/api/coordinations"
import { StatusChip } from "@/components/ui/status-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight, Calendar, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

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

  // Basic client-side search across the current page results (real impl would search backend)
  const filteredData = data?.content.filter((item: any) => 
    searchQuery === "" || 
    (item.meetingTitle && item.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const states = ["ALL", "INITIATED", "MATCHING", "PROPOSAL_GENERATED", "AWAITING_APPROVAL_A", "AWAITING_APPROVAL_B", "APPROVED_BY_BOTH", "COMPLETED", "REJECTED", "FAILED"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coordinations</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Complete history of your agent's scheduling activities.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/10">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-foreground/40" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm outline-none w-full sm:w-auto text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {states.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="p-6">
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-foreground/50">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="text-sm font-medium">Loading coordinations...</p>
            </div>
          )}
          
          {!isLoading && filteredData?.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-foreground/40 bg-muted/5 border border-dashed border-border/50 rounded-2xl">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">No coordinations found matching the criteria.</p>
            </div>
          )}

          {!isLoading && filteredData && filteredData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((coord: any) => (
                <div 
                  key={coord.coordinationId} 
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-background/80 to-muted/20 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
                >
                  {/* Decorative background gradient */}
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
                  
                  <div className="relative flex-grow space-y-4">
                    <div className="flex items-start justify-between">
                      <StatusChip state={coord.state} />
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/50 text-[10px] font-medium text-foreground/70">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        ID: {coord.coordinationId.substring(0, 6)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-2">
                        {coord.meetingTitle || "Active Sync Session"}
                      </h3>
                      <div className="mt-3 flex items-center gap-2 text-sm text-foreground/60">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {coord.meetingTime 
                              ? new Date(coord.meetingTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                              : 'Pending Time'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {coord.meetingTime 
                              ? new Date(coord.meetingTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) 
                              : 'TBD'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
                    <p className="text-xs text-foreground/50">
                      Started {new Date(coord.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" asChild>
                      <Link href={`/dashboard/coordinations/${coord.coordinationId}`}>
                        View Progress <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60 bg-card/60">
            <div>
              Showing {page * 20 + 1}-{Math.min((page + 1) * 20, data.totalElements)} of {data.totalElements} entries
            </div>
            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/40">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg" 
                disabled={data.isFirst}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 font-medium text-foreground text-xs">
                Page {page + 1} of {data.totalPages}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg" 
                disabled={data.isLast}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ContentRecordListItem } from "@/lib/content-records"

interface ContentCalendarViewProps {
  clientId?: string | null
  clientName?: string | null
  selectedMonth?: string | null
  refreshKey?: number
  onCreatePost: () => void
}

type ClientOption = {
  id: string
  name: string
}

type CalendarPost = {
  id: string
  client: string
  platform: string
  date: string
  eventType: "planned" | "scheduled" | "published"
  message: string
}

const EVENT_COLORS: Record<CalendarPost["eventType"], string> = {
  planned: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
}

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function toTitleCase(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function formatShortDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  })
}

function buildCalendarEvent(record: ContentRecordListItem): CalendarPost | null {
  const status = record.status?.toUpperCase()

  // Use lifecycle precedence so notifications are consistent across all pages:
  // published > scheduled > planned.
  let eventType: CalendarPost["eventType"] = "planned"
  let date = record.plannedDate || ""

  if (record.publishedDate || status === "PUBLISHED") {
    eventType = "published"
    date = record.publishedDate || record.scheduledDate || record.plannedDate || ""
  } else if (record.scheduledDate || status === "SCHEDULED") {
    eventType = "scheduled"
    date = record.scheduledDate || record.plannedDate || ""
  }

  if (!date) {
    return null
  }

  const platform = toTitleCase(record.platform)
  const client = record.client

  return {
    id: record.id,
    client,
    platform,
    date,
    eventType,
    message: `${platform} post ${eventType} for ${client} on ${formatShortDate(date)}`,
  }
}

export function ContentCalendarView({ clientId, clientName, selectedMonth = null, refreshKey = 0, onCreatePost }: ContentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedClient, setSelectedClient] = useState(clientName || "All Clients")
  const [clients, setClients] = useState<ClientOption[]>([])
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedClient(clientName || "All Clients")
  }, [clientName])

  useEffect(() => {
    if (!selectedMonth) {
      return
    }

    const monthIndex = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ].indexOf(selectedMonth.toLowerCase())

    if (monthIndex === -1) {
      return
    }

    setCurrentDate((current) => new Date(current.getFullYear(), monthIndex, 1))
  }, [selectedMonth])

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("sessionToken")
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const month = currentDate.toLocaleString("default", { month: "long" }).toLowerCase()
        const params = new URLSearchParams({
          viewMode: "all",
          month,
        })

        if (clientId) {
          params.append("clientId", clientId)
        } else if (selectedClient !== "All Clients") {
          params.append("client", selectedClient)
        }

        const [clientsResponse, recordsResponse] = await Promise.all([
          fetch("/api/clients", { headers }),
          fetch(`/api/content/records?${params.toString()}`, { headers }),
        ])

        if (!clientsResponse.ok || !recordsResponse.ok) {
          throw new Error("Failed to load calendar data")
        }

        const clientsData = await clientsResponse.json()
        const recordsData = await recordsResponse.json()

        const calendarPosts = (recordsData.records || [])
          .map((record: ContentRecordListItem) => buildCalendarEvent(record))
          .filter((record: CalendarPost | null): record is CalendarPost => Boolean(record))

        setClients(clientsData.clients || [])
        setPosts(calendarPosts)
      } catch (loadError) {
        console.error("[v0] Failed to load content calendar:", loadError)
        setError(loadError instanceof Error ? loadError.message : "Failed to load calendar data")
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [clientId, currentDate, refreshKey, selectedClient])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = MONTH_OPTIONS.findIndex((option) => option.toLowerCase() === month.toLowerCase())
    if (monthIndex === -1) {
      return
    }

    setCurrentDate((current) => new Date(current.getFullYear(), monthIndex, 1))
  }

  const getPostsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return posts.filter((post) => post.date === dateStr)
  }

  const filteredPosts = useMemo(() => {
    if (clientId || selectedClient === "All Clients") {
      return posts
    }

    return posts.filter((post) => post.client === selectedClient)
  }, [clientId, posts, selectedClient])

  const totalPosts = filteredPosts.length
  const daysWithPosts = new Set(filteredPosts.map(p => p.date)).size
  const avgPostsPerDay = daysWithPosts > 0 ? (totalPosts / daysWithPosts).toFixed(1) : 0
  const clientOptions = ["All Clients", ...clients.map((client) => client.name)]

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading calendar...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with month, client filter, and navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <p className="text-sm text-gray-600 mt-1">{totalPosts} posts scheduled across {daysWithPosts} days</p>
          </div>
          
          {/* Client Filter Dropdown */}
          {!clientId && (
          <div className="pl-4 border-l border-gray-200">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Filter by Client</label>
            <select 
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
            >
              {clientOptions.map((client) => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <select
            value={currentDate.toLocaleDateString("en-US", { month: "long" })}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
            aria-label="Select calendar month"
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square border-b border-r border-gray-200 bg-gray-50" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1
            const dayPosts = getPostsForDate(day)
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()

            return (
              <div
                key={day}
                className={`aspect-square border-b border-r border-gray-200 p-2 hover:bg-blue-50 transition-colors ${
                  isToday ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.map((post, i) => (
                    <div
                      key={`${post.id}-${i}`}
                      className={`text-xs px-2 py-1 rounded truncate font-medium ${EVENT_COLORS[post.eventType]}`}
                      title={`${post.message} on ${post.date}`}
                    >
                      {post.message}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && totalPosts === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          No content scheduled for this month.
        </div>
      )}

      {/* Balance Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium mb-2">PUBLISHING BALANCE</p>
            <p className="text-sm text-gray-700">
              {totalPosts} posts across {daysWithPosts} days
              <span className={`ml-2 font-semibold ${daysWithPosts > 15 ? "text-green-600" : daysWithPosts > 8 ? "text-amber-600" : "text-red-600"}`}>
                {daysWithPosts > 15 ? "Balanced" : daysWithPosts > 8 ? "Moderate" : "Light"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-medium mb-2">AVG PER DAY</p>
            <p className="text-2xl font-bold text-gray-900">{avgPostsPerDay}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

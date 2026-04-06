import { Edit2, Trash2, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeEntry {
  id: string
  client_id: string
  sprint_id: string
  task_id: string
  hours: number
  description: string
  clients?: { name: string }
  sprints?: { name: string }
  tasks?: { title: string }
  created_at?: string
}

interface TimeEntryListProps {
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => Promise<void>
  isDeleting?: string | null
}

export function TimeEntryList({ entries, onEdit, onDelete, isDeleting }: TimeEntryListProps) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-8 text-center">
        <Calendar className="w-12 h-12 text-[#D1D1D6] mx-auto mb-3" />
        <p className="text-[#86868B] text-sm">No time entries yet</p>
        <p className="text-[#BDBDBE] text-xs mt-1">Add your first entry to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Total Hours</span>
        </div>
        <div className="text-3xl font-black">{totalHours.toFixed(2)}</div>
        <div className="text-xs text-blue-100 mt-2">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg border border-[#E5E5E7] p-4 hover:border-[#D1D1D6] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-blue-700">
                    {entry.hours} hrs
                  </span>
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">
                    {entry.clients?.name || "Unknown Client"}
                  </span>
                </div>

                {/* Sprint and Task */}
                <div className="mb-3">
                  <p className="text-xs text-[#86868B] mb-1">
                    Sprint: <span className="font-medium text-[#1D1D1F]">{entry.sprints?.name || "Unknown"}</span>
                  </p>
                  <p className="text-xs text-[#86868B]">
                    Task: <span className="font-medium text-[#1D1D1F]">{entry.tasks?.title || "Unknown"}</span>
                  </p>
                </div>

                {/* Description */}
                <div className="bg-[#F5F5F7] rounded p-3 mb-2">
                  <p className="text-xs text-[#1D1D1F] leading-relaxed line-clamp-2">
                    {entry.description}
                  </p>
                </div>

                {/* Timestamp */}
                {entry.created_at && (
                  <p className="text-xs text-[#BDBDBE]">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(entry)}
                  className="p-2 hover:bg-[#F5F5F7] rounded transition-colors text-[#6B7280]"
                  title="Edit entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  disabled={isDeleting === entry.id}
                  className={cn(
                    "p-2 hover:bg-red-50 rounded transition-colors text-[#FF3B30]",
                    isDeleting === entry.id && "opacity-50 cursor-not-allowed"
                  )}
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

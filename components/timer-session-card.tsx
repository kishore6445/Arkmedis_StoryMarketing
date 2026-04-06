'use client'

import { useState } from 'react'
import { Edit2, Trash2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimerSession, formatTime, secondsToHours } from '@/lib/timer-service'

interface TimerSessionCardProps {
  session: TimerSession
  onAddToReport: (session: TimerSession) => void
  onEdit?: (session: TimerSession) => void
  onDelete?: (sessionId: string) => void
}

export function TimerSessionCard({
  session,
  onAddToReport,
  onEdit,
  onDelete,
}: TimerSessionCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const hours = secondsToHours(session.duration)
  const startDate = new Date(session.startTime)
  const endDate = session.endTime ? new Date(session.endTime) : new Date()
  const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  const handleAddToReport = () => {
    onAddToReport(session)
    setIsAdded(true)
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
      {/* Left: Session Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-semibold text-gray-900 truncate">{session.taskTitle}</h4>
            <p className="text-xs text-gray-600">
              {session.clientName} • {session.sprintName}
            </p>
          </div>
          <div className={cn('px-2 py-1 rounded text-xs font-medium whitespace-nowrap', 
            session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          )}>
            {session.isActive ? 'Active' : 'Completed'}
          </div>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-600">Duration: </span>
            <span className="font-mono font-semibold text-gray-900">{formatTime(session.duration)}</span>
            <span className="text-gray-600"> ({hours}h)</span>
          </div>
          <div className="text-gray-600">{timeRange}</div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {isAdded ? (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Added
          </div>
        ) : (
          <button
            onClick={handleAddToReport}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Add to Report
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(session)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(session.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

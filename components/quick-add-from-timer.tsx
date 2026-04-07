'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTodaysSessions, secondsToHours, formatTime } from '@/lib/timer-service'
import { TimerSessionCard } from './timer-session-card'

interface QuickAddFromTimerProps {
  onAddEntry: (taskId: string, hours: number, clientName: string, sprintName: string, taskTitle: string) => void
}

export function QuickAddFromTimer({ onAddEntry }: QuickAddFromTimerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editHours, setEditHours] = useState(0)

  const todaysSessions = getTodaysSessions()
  const totalHours = todaysSessions.reduce((sum, s) => sum + secondsToHours(s.duration), 0)

  if (todaysSessions.length === 0) {
    return null
  }

  const handleAddSessionToReport = (session: any) => {
    const hours = secondsToHours(session.duration)
    onAddEntry(session.taskId, hours, session.clientName, session.sprintName, session.taskTitle)
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Quick Add from Timer</h3>
            <p className="text-sm text-gray-600">
              {todaysSessions.length} session{todaysSessions.length !== 1 ? 's' : ''} • {totalHours.toFixed(2)}h total
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-blue-200 px-6 py-4 space-y-3">
          {todaysSessions.map(session => (
            <TimerSessionCard
              key={session.id}
              session={session}
              onAddToReport={handleAddSessionToReport}
            />
          ))}

          {/* Summary */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total tracked time today:</span>
              <span className="font-mono font-bold text-lg text-blue-600">{formatTime(todaysSessions.reduce((sum, s) => sum + s.duration, 0))}</span>
            </div>
            <div className="text-xs text-gray-600">
              You can adjust hours manually when adding entries to your report if you forgot to stop the timer.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Play, Pause, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumTaskCardProps {
  taskId: string
  taskTitle: string
  clientName: string
  sprintName: string
  dueDate?: string
  priority?: 'high' | 'medium' | 'low'
  isCompleted?: boolean
  onCardClick: () => void
  onTimerStart: (e: React.MouseEvent) => void
  onTimerPause: (e: React.MouseEvent) => void
  onTimerStop: (e: React.MouseEvent) => void
  timerState?: 'idle' | 'running' | 'paused'
  elapsedTime?: number
}

export function PremiumTaskCard({
  taskId,
  taskTitle,
  clientName,
  sprintName,
  dueDate,
  priority = 'medium',
  isCompleted = false,
  onCardClick,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  timerState = 'idle',
  elapsedTime = 0,
}: PremiumTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isRunning = timerState === 'running'
  const isPaused = timerState === 'paused'

  if (isCompleted) {
    return (
      <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">{taskId}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{clientName}</div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{taskTitle}</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCardClick}
      className={cn(
        'bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 relative',
        'border shadow-sm hover:shadow-md',
        isRunning
          ? 'border-green-400 bg-gradient-to-br from-white to-green-50/30'
          : isPaused
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-gray-200 hover:border-gray-300',
        isHovered && !isRunning && 'translate-y-[-2px]'
      )}
    >
      {isRunning && <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="text-xs font-medium text-gray-500 uppercase">{taskId}</div>
            <div className="text-xs text-gray-600">{clientName}</div>
          </div>
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full flex-shrink-0',
              priority === 'high' && 'bg-red-400',
              priority === 'medium' && 'bg-yellow-400',
              priority === 'low' && 'bg-blue-400'
            )}
          />
        </div>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{taskTitle}</h3>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{sprintName}</span>
          {dueDate && <span>•</span>}
          {dueDate && <span className="font-medium">{dueDate}</span>}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          {elapsedTime > 0 && (
            <div className="text-sm font-mono font-semibold text-gray-900">{formatTime(elapsedTime)}</div>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {timerState === 'idle' && (
              <button
                onClick={onTimerStart}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start
              </button>
            )}

            {isRunning && (
              <>
                <button
                  onClick={onTimerPause}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={onTimerStop}
                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={onTimerStart}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={onTimerStop}
                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {isRunning && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">In Focus</span>}
          {isPaused && <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Paused</span>}
        </div>
      </div>
    </div>
  )
}

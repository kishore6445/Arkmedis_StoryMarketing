'use client'

import { useState, useEffect } from 'react'
import { X, Pause, Play, StopCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  clientName: string
  sprintName: string
  elapsedTime: number
  isRunning: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onComplete?: () => void
}

export function FocusMode({
  isOpen,
  onClose,
  taskTitle,
  clientName,
  sprintName,
  elapsedTime,
  isRunning,
  onPause,
  onResume,
  onStop,
  onComplete,
}: FocusModeProps) {
  const [timerMode, setTimerMode] = useState<'free' | 'pomodoro25' | 'pomodoro50'>('free')

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Focus Mode</h2>
            <p className="text-xs text-gray-500 mt-1">Deep work in progress</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
          {/* Task Info */}
          <div className="text-center w-full">
            <div className="text-sm text-gray-500 mb-2">{clientName}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{taskTitle}</h3>
            <div className="text-xs text-gray-500">{sprintName}</div>
          </div>

          {/* Large Timer Display */}
          <div className="text-center">
            <div className="text-7xl font-mono font-bold text-gray-900 tracking-tight">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-500 mt-4">
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  In Focus
                </span>
              ) : (
                <span className="text-amber-600">Paused</span>
              )}
            </div>
          </div>

          {/* Timer Mode Selector */}
          <div className="flex gap-2 w-full">
            {[
              { value: 'free' as const, label: 'Free' },
              { value: 'pomodoro25' as const, label: '25/5' },
              { value: 'pomodoro50' as const, label: '50/10' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setTimerMode(mode.value)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  timerMode === mode.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full">
            {!isRunning ? (
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}

            <button
              onClick={onStop}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <StopCircle className="w-5 h-5" />
              Stop
            </button>
          </div>

          {/* Secondary Action */}
          {onComplete && (
            <button
              onClick={onComplete}
              className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors border border-green-200"
            >
              Mark Task Complete
            </button>
          )}

          {/* Note Field */}
          <div className="w-full">
            <label className="text-xs font-medium text-gray-700 block mb-2">What are you working on?</label>
            <textarea
              placeholder="Add optional notes about your work..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

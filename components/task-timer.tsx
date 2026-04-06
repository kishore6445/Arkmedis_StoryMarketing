'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  startTimerSession,
  stopTimerSession,
  pauseTimerSession,
  resumeTimerSession,
  getTimerSession,
  getElapsedTime,
  formatTime,
} from '@/lib/timer-service'

interface TaskTimerProps {
  taskId: string
  taskTitle: string
  clientName: string
  sprintName: string
  onClose?: () => void
  compact?: boolean
}

export function TaskTimer({
  taskId,
  taskTitle,
  clientName,
  sprintName,
  onClose,
  compact = false,
}: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  // Check if there's an existing session
  useEffect(() => {
    const session = getTimerSession(taskId)
    if (session) {
      setHasStarted(true)
      setIsRunning(session.isActive)
      setElapsed(getElapsedTime(taskId))
    }
  }, [taskId])

  // Update elapsed time every second
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsed(getElapsedTime(taskId))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, taskId])

  const handleStart = useCallback(() => {
    if (!hasStarted) {
      startTimerSession(taskId, taskTitle, clientName, sprintName)
      setHasStarted(true)
    } else {
      resumeTimerSession(taskId)
    }
    setIsRunning(true)
  }, [taskId, taskTitle, clientName, sprintName, hasStarted])

  const handlePause = useCallback(() => {
    pauseTimerSession(taskId)
    setIsRunning(false)
  }, [taskId])

  const handleStop = useCallback(() => {
    stopTimerSession(taskId)
    setIsRunning(false)
  }, [taskId])

  const handleReset = useCallback(() => {
    stopTimerSession(taskId)
    setIsRunning(false)
    setHasStarted(false)
    setElapsed(0)
  }, [taskId])

  // Calculate progress for color coding
  const pomodoroDuration = 25 * 60 // 25 minutes in seconds
  const progressPercent = (elapsed / pomodoroDuration) * 100
  let statusColor = 'text-green-600'
  let bgColor = 'bg-green-50'
  if (progressPercent >= 90) {
    statusColor = 'text-red-600'
    bgColor = 'bg-red-50'
  } else if (progressPercent >= 50) {
    statusColor = 'text-yellow-600'
    bgColor = 'bg-yellow-50'
  }

  if (compact) {
    return (
      <div className={cn('p-3 rounded-lg border border-gray-200', bgColor)}>
        <div className="flex items-center justify-between gap-2">
          <div className={cn('text-lg font-mono font-bold', statusColor)}>
            {formatTime(elapsed)}
          </div>
          <div className="flex gap-1">
            {!isRunning && hasStarted ? (
              <>
                <button
                  onClick={handleStart}
                  className="p-1.5 rounded hover:bg-white transition-colors text-green-600 hover:shadow-sm"
                  title="Resume"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded hover:bg-white transition-colors text-gray-600 hover:shadow-sm"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={isRunning ? handlePause : handleStart}
                className={cn(
                  'p-1.5 rounded hover:shadow-sm transition-colors',
                  isRunning
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-150'
                    : 'bg-green-100 text-green-600 hover:bg-green-150'
                )}
                title={isRunning ? 'Pause' : 'Start'}
              >
                {isRunning ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-gray-200 p-6', bgColor)}>
      <div className="space-y-4">
        {/* Task Info */}
        <div>
          <h3 className="font-semibold text-gray-900">{taskTitle}</h3>
          <p className="text-xs text-gray-600 mt-1">
            {clientName} • {sprintName}
          </p>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center gap-4">
          {/* Circular Progress Ring */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="75"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="75"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(progressPercent / 100) * 471} 471`}
                strokeLinecap="round"
                className={cn('transition-all duration-300', statusColor)}
              />
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={cn('text-5xl font-mono font-bold', statusColor)}>
                {formatTime(elapsed)}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {isRunning ? 'Running' : hasStarted ? 'Paused' : 'Not started'}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-sm text-gray-600">
            {progressPercent >= 90 && '🔴 Over Pomodoro time'}
            {progressPercent >= 50 && progressPercent < 90 && '🟡 3/4 of Pomodoro'}
            {progressPercent < 50 && hasStarted && '🟢 In progress'}
            {!hasStarted && 'Ready to start'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isRunning && hasStarted ? (
            <>
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </>
          ) : (
            <>
              <button
                onClick={isRunning ? handlePause : handleStart}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium',
                  isRunning
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Start
                  </>
                )}
              </button>
              {hasStarted && (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Stop
                </button>
              )}
            </>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

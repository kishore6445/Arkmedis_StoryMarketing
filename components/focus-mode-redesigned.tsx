"use client"

import { useState, useEffect } from "react"
import { Pause, Play, Square, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  clientName: string
  sprintName: string
  elapsedSeconds: number
  isRunning: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onComplete?: () => void
  pomodoroMode?: "free" | "25/5" | "50/10" | "custom"
  onPomodoroChange?: (mode: string) => void
}

export function FocusMode({
  isOpen,
  onClose,
  taskTitle,
  clientName,
  sprintName,
  elapsedSeconds,
  isRunning,
  onPause,
  onResume,
  onStop,
  onComplete,
  pomodoroMode = "free",
  onPomodoroChange,
}: FocusModeProps) {
  const [displayTime, setDisplayTime] = useState("00:00:00")

  useEffect(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60
    setDisplayTime(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    )
  }, [elapsedSeconds])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header - Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Focus Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
          {/* Task Info */}
          <div className="text-center space-y-2 w-full">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{clientName} • {sprintName}</p>
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-3">{taskTitle}</h3>
          </div>

          {/* Large Timer Display */}
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono text-7xl font-black text-gray-900 tracking-tight">
              {displayTime}
            </div>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              isRunning ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              {isRunning ? "Session Active" : "Paused"}
            </div>
          </div>

          {/* Pomodoro Mode Selector */}
          <div className="w-full space-y-2">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Timer Mode</label>
            <div className="flex gap-2">
              {["free", "25/5", "50/10"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onPomodoroChange?.(mode)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    pomodoroMode === mode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {mode === "free" ? "Free" : `${mode} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes Field */}
          <div className="w-full space-y-2">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">What are you working on?</label>
            <textarea
              placeholder="Add optional notes..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Session Stats */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="px-3 py-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-600">Today's Total</p>
              <p className="text-lg font-semibold text-gray-900">2:15</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-gray-50 text-center">
              <p className="text-xs text-gray-600">This Session</p>
              <p className="text-lg font-semibold text-gray-900">{Math.floor(elapsedSeconds / 60)} min</p>
            </div>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="border-t border-gray-100 p-6 space-y-3">
          <div className="flex gap-2">
            {isRunning ? (
              <>
                <button
                  onClick={onPause}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={onStop}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            ) : (
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
          </div>
          {onComplete && (
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors border border-blue-200"
            >
              <Check className="w-4 h-4" />
              Mark Task Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

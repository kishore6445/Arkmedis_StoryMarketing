"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, CheckCircle2, AlertCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardRedesignedProps {
  taskId: string
  taskNumber: string
  title: string
  clientName: string
  sprintName: string
  description?: string
  dueDate?: string
  isOverdue?: boolean
  priority?: "high" | "medium" | "low"
  isCompleted?: boolean
  timerState?: "default" | "running" | "paused"
  elapsedSeconds?: number
  onTaskClick: () => void
  onTimerStart: (e: React.MouseEvent) => void
  onTimerPause: (e: React.MouseEvent) => void
  onTimerStop: (e: React.MouseEvent) => void
  onTimerResume: (e: React.MouseEvent) => void
}

export function TaskCardRedesigned({
  taskId,
  taskNumber,
  title,
  clientName,
  sprintName,
  description,
  dueDate,
  isOverdue,
  priority = "medium",
  isCompleted,
  timerState = "default",
  elapsedSeconds = 0,
  onTaskClick,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  onTimerResume,
}: TaskCardRedesignedProps) {
  const [displayTime, setDisplayTime] = useState("00:00")

  useEffect(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60
    
    if (hours > 0) {
      setDisplayTime(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    } else {
      setDisplayTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }
  }, [elapsedSeconds])

  const priorityDot = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#3B82F6",
  }

  const isRunning = timerState === "running"
  const isPaused = timerState === "paused"

  return (
    <div
      onClick={onTaskClick}
      className={cn(
        "relative flex flex-col rounded-lg border transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:-translate-y-0.5",
        isCompleted && "bg-green-50 border-green-200",
        !isCompleted && isRunning && "bg-green-50 border-green-300 shadow-lg shadow-green-100",
        !isCompleted && isPaused && "bg-amber-50 border-amber-200",
        !isCompleted && timerState === "default" && "bg-white border-gray-200"
      )}
    >
      {/* Green pulse indicator when running */}
      {isRunning && (
        <>
          <div className="absolute inset-0 rounded-lg bg-green-400 opacity-0 animate-pulse" />
          <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </>
      )}

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Header: Task ID + Priority */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{taskNumber}</span>
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: priorityDot[priority] }}
            title={`Priority: ${priority}`}
          />
        </div>

        {/* Client Name - Muted */}
        <div className="text-xs text-gray-500">{clientName}</div>

        {/* Task Title - Main Focus */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{title}</h3>

        {/* Description Preview */}
        {description && (
          <p className="text-xs text-gray-600 line-clamp-1">{description}</p>
        )}

        {/* Due Date / Status Badges */}
        <div className="flex items-center gap-2 mt-1">
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
              <CheckCircle2 className="w-3 h-3" />
              Done
            </span>
          )}
          {dueDate && !isCompleted && (
            <span className="text-xs text-gray-600">{dueDate}</span>
          )}
        </div>
      </div>

      {/* Timer Action Zone - Separated */}
      {!isCompleted && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
          {/* Timer Display & Status */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700 font-medium">In Focus</span>
                </div>
              </>
            )}
            {isPaused && (
              <span className="text-xs text-amber-700 font-medium">Paused</span>
            )}
            <span className={cn(
              "font-mono text-sm font-semibold",
              isRunning && "text-green-600",
              isPaused && "text-amber-600",
              timerState === "default" && "text-gray-400"
            )}>
              {displayTime}
            </span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-1">
            {timerState === "default" && (
              <button
                onClick={onTimerStart}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                title="Start timer"
              >
                <Play className="w-3.5 h-3.5" />
                Start
              </button>
            )}

            {isRunning && (
              <>
                <button
                  onClick={onTimerPause}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Pause timer"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={onTimerStop}
                  className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                  title="Stop timer"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={onTimerResume}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                  title="Resume timer"
                >
                  <Play className="w-3 h-3" />
                </button>
                <button
                  onClick={onTimerStop}
                  className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                  title="Stop timer"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

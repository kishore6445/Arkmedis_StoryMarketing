import { useState, useCallback, useEffect } from "react"

interface ActiveTimer {
  taskId: string
  taskTitle: string
  startedAt: number
  elapsedSeconds: number
  isPaused: boolean
}

interface UseTaskTimerReturn {
  activeTimer: ActiveTimer | null
  elapsedSeconds: number
  isRunning: boolean
  isPaused: boolean
  startTimer: (taskId: string, taskTitle: string) => Promise<boolean>
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => TimeEntry | null
  getTimerState: (taskId: string) => "default" | "running" | "paused"
}

interface TimeEntry {
  taskId: string
  taskTitle: string
  duration: number
  createdAt: number
}

const STORAGE_KEY = "active_timer"
const TIMER_INTERVAL = 1000

export function useTaskTimer(): UseTaskTimerReturn {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Load timer from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const timer = JSON.parse(stored)
        setActiveTimer(timer)
      } catch (e) {
        console.error("Failed to load timer from storage", e)
      }
    }
  }, [])

  // Update timer display every second
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return prev
        const now = Date.now()
        const newElapsed = Math.floor((now - prev.startedAt) / 1000) + prev.elapsedSeconds
        setElapsedSeconds(newElapsed)
        return prev
      })
    }, TIMER_INTERVAL)

    return () => clearInterval(interval)
  }, [activeTimer])

  const startTimer = useCallback(
    async (taskId: string, taskTitle: string): Promise<boolean> => {
      // If there's already an active timer on a different task, return false
      // The component should handle showing the confirmation modal
      if (activeTimer && activeTimer.taskId !== taskId && !activeTimer.isPaused) {
        return false
      }

      const timer: ActiveTimer = {
        taskId,
        taskTitle,
        startedAt: Date.now(),
        elapsedSeconds: activeTimer?.elapsedSeconds || 0,
        isPaused: false,
      }

      setActiveTimer(timer)
      setElapsedSeconds(timer.elapsedSeconds)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
      return true
    },
    [activeTimer]
  )

  const pauseTimer = useCallback(() => {
    if (!activeTimer) return
    const updatedTimer: ActiveTimer = {
      ...activeTimer,
      isPaused: true,
      elapsedSeconds,
    }
    setActiveTimer(updatedTimer)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimer))
  }, [activeTimer, elapsedSeconds])

  const resumeTimer = useCallback(() => {
    if (!activeTimer) return
    const updatedTimer: ActiveTimer = {
      ...activeTimer,
      startedAt: Date.now(),
      isPaused: false,
    }
    setActiveTimer(updatedTimer)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimer))
  }, [activeTimer])

  const stopTimer = useCallback((): TimeEntry | null => {
    if (!activeTimer) return null

    const entry: TimeEntry = {
      taskId: activeTimer.taskId,
      taskTitle: activeTimer.taskTitle,
      duration: elapsedSeconds / 3600, // Convert to hours
      createdAt: Date.now(),
    }

    setActiveTimer(null)
    setElapsedSeconds(0)
    localStorage.removeItem(STORAGE_KEY)

    return entry
  }, [activeTimer, elapsedSeconds])

  const getTimerState = useCallback(
    (taskId: string): "default" | "running" | "paused" => {
      if (!activeTimer || activeTimer.taskId !== taskId) return "default"
      if (activeTimer.isPaused) return "paused"
      return "running"
    },
    [activeTimer]
  )

  return {
    activeTimer,
    elapsedSeconds,
    isRunning: activeTimer && !activeTimer.isPaused ? true : false,
    isPaused: activeTimer && activeTimer.isPaused ? true : false,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTimerState,
  }
}

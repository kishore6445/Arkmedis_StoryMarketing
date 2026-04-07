"use client"

import { X } from "lucide-react"

interface SwitchTimerConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  currentTaskTitle: string
  newTaskTitle: string
  isLoading?: boolean
}

export function SwitchTimerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentTaskTitle,
  newTaskTitle,
  isLoading,
}: SwitchTimerConfirmProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Switch Timer?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            A timer is already running on another task. Stop the current timer and start this one?
          </p>

          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">Current Task</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{currentTaskTitle}</p>
            </div>
            <div className="h-px bg-gray-200" />
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">New Task</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{newTaskTitle}</p>
            </div>
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            The time from the current timer will be saved to your daily report.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Keep Current
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Switching..." : "Switch Timer"}
          </button>
        </div>
      </div>
    </div>
  )
}

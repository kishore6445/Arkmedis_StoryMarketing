"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = { id, type, message, duration }

    setToasts((prev) => [...prev, toast])

    if (duration) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

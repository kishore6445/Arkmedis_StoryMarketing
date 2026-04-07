'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { upsertTarget, PLATFORMS, type Platform } from '@/lib/platform-targets-service'

interface TargetEditorModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  month: string
  year: number
  platform: Platform
  currentTarget: number
  onSaved?: () => void
}

export function TargetEditorModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  month,
  year,
  platform,
  currentTarget,
  onSaved,
}: TargetEditorModalProps) {
  const [value, setValue] = useState(currentTarget)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      await upsertTarget(clientId, month, year, platform, value)
      onSaved?.()
      onClose()
    } catch (err) {
      setError('Failed to save target. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Target</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{clientName}</span> •{' '}
              <span className="font-medium text-gray-900">{platform}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {month.charAt(0).toUpperCase() + month.slice(1)} {year}
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Posts/Month
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">posts</p>
          </div>

          {/* Error */}
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              loading
                ? 'bg-gray-300 text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { AlertCircle, CheckCircle2, X } from "lucide-react"

interface SubmitReportModalProps {
  isOpen: boolean
  totalHours: number
  entriesCount: number
  isSubmitting: boolean
  onSubmit: () => Promise<void>
  onCancel: () => void
  error?: string
}

export function SubmitReportModal({
  isOpen,
  totalHours,
  entriesCount,
  isSubmitting,
  onSubmit,
  onCancel,
  error,
}: SubmitReportModalProps) {
  if (!isOpen) return null

  const maxHours = 8
  const isValidHours = totalHours > 0 && totalHours <= maxHours

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1D1D1F]">Submit Daily Report</h2>
            <p className="text-xs text-[#86868B] mt-1">Review your entries before submitting</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-3 mb-6 bg-[#F5F5F7] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#86868B]">Total Hours:</span>
            <span className={`font-semibold ${isValidHours ? "text-[#007AFF]" : "text-red-600"}`}>
              {totalHours.toFixed(2)} hours
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#86868B]">Entries:</span>
            <span className="font-semibold text-[#1D1D1F]">{entriesCount}</span>
          </div>
          {!isValidHours && (
            <div className="flex gap-2 pt-2 border-t border-[#E5E5E7]">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                {totalHours === 0 
                  ? "Add at least one time entry"
                  : `Hours should not exceed ${maxHours} hours per day`}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700">
            Once submitted, you won&apos;t be able to edit this report until the next day.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] disabled:opacity-50 font-medium text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isValidHours}
            className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium text-sm transition-all"
          >
            {isSubmitting ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}

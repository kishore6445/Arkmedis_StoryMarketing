import { Calendar, CheckCircle2, Clock } from "lucide-react"

interface DailyReportHeaderProps {
  date: string
  totalHours: number
  status: "draft" | "submitted"
  submittedAt?: string
  userName?: string
}

export function DailyReportHeader({
  date,
  totalHours,
  status,
  submittedAt,
  userName = "User",
}: DailyReportHeaderProps) {
  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const isSubmitted = status === "submitted"

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-[#007AFF]" />
            <h1 className="text-2xl font-black text-[#1D1D1F]">Daily Report</h1>
          </div>
          <p className="text-sm text-[#86868B]">
            {formattedDate} • {userName}
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
            isSubmitted
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-orange-50 text-orange-700 border border-orange-200"
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submitted
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Draft
            </>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-[#F5F5F7] rounded-lg p-3">
          <p className="text-xs text-[#86868B] font-semibold uppercase tracking-wide mb-1">
            Total Hours
          </p>
          <p className="text-2xl font-black text-[#1D1D1F]">
            {totalHours.toFixed(2)}
            <span className="text-xs text-[#86868B] ml-1">/ 8 hrs</span>
          </p>
        </div>

        {isSubmitted && submittedAt && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
              Submitted
            </p>
            <p className="text-sm font-medium text-green-900">
              {new Date(submittedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {!isSubmitted && (
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-1">
              Status
            </p>
            <p className="text-sm font-medium text-orange-900">Ready to submit</p>
          </div>
        )}
      </div>
    </div>
  )
}

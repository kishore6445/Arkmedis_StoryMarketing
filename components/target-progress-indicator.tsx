'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPlatformTarget, getCurrentMonthYear } from '@/lib/platform-targets-service'
import type { Platform } from '@/lib/platform-targets-service'

interface TargetProgressIndicatorProps {
  clientId: string
  platform: Platform
  currentCount: number
  className?: string
}

export function TargetProgressIndicator({
  clientId,
  platform,
  currentCount,
  className,
}: TargetProgressIndicatorProps) {
  const [target, setTarget] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTarget = async () => {
      const { month, year } = getCurrentMonthYear()
      const platformTarget = await getPlatformTarget(clientId, month, year, platform)
      setTarget(platformTarget)
      setLoading(false)
    }

    loadTarget()
  }, [clientId, platform])

  if (loading) return null

  if (target === 0) return null

  const percentage = Math.min(100, Math.round((currentCount / target) * 100))
  const isOnTrack = currentCount >= target * 0.7
  const isComplete = currentCount >= target

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {platform} Target Progress
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{currentCount}</span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-medium text-gray-600">{target}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isComplete
              ? 'bg-green-500'
              : isOnTrack
                ? 'bg-blue-500'
                : 'bg-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Target Complete</span>
          </>
        ) : isOnTrack ? (
          <>
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              {target - currentCount} more posts to complete
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              {target - currentCount} posts needed to stay on track
            </span>
          </>
        )}
      </div>
    </div>
  )
}

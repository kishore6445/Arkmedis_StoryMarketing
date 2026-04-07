"use client"

import { Suspense, lazy } from "react"
import { AuthGuard } from "@/components/auth-guard"

// Lazy load all heavy components
const DashboardContent = lazy(() => import("@/components/dashboard-content").then(m => ({ default: m.DashboardContent })))

function MinimalShell() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="flex">
        <div className="w-64 h-screen bg-white border-r border-gray-200" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#86868B]">Loading dashboard...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<MinimalShell />}>
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  )
}

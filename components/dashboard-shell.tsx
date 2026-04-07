'use client'

import dynamic from 'next/dynamic'

// Dynamically import DashboardContent with no SSR
// This ensures NO server-side rendering, preventing data serialization
const DashboardContent = dynamic(() => import('@/components/dashboard-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#86868B]">Loading dashboard...</p>
      </div>
    </div>
  ),
})

export default function DashboardShell() {
  return <DashboardContent />
}

"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { WeeklySummary } from "@/components/weekly-summary"
import { BreadcrumbTrail } from "@/components/breadcrumb-trail"

export default function WeeklySummaryPage() {
  const [selectedPhase, setSelectedPhase] = useState("weekly-summary")
  const { user } = useAuth()

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white">
        <Sidebar onPhaseChange={setSelectedPhase} currentPhase={selectedPhase} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav user={user} />
          <BreadcrumbTrail
            items={[
              { label: "Home", onClick: () => window.location.href = "/" },
              { label: "Weekly Summary", active: true },
            ]}
          />
          <div className="flex-1 overflow-auto">
            <WeeklySummary />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

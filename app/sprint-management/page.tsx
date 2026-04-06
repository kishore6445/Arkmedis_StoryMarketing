"use client"

import { BreadcrumbTrail } from "@/components/breadcrumb-trail"
import { SprintManagementDashboard } from "@/components/sprint-management-dashboard"

export default function SprintManagementPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbTrail
        items={[
          { label: "Home", onClick: () => window.location.href = "/" },
          { label: "Sprint Management", active: true },
        ]}
      />
      <SprintManagementDashboard />
    </div>
  )
}

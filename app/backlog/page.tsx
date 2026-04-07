import { BreadcrumbTrail } from "@/components/breadcrumb-trail"
import { BacklogDashboard } from "@/components/backlog-dashboard"

export default function BacklogPage() {
  return (
    <>
      <BreadcrumbTrail
        items={[
          { label: "Home", onClick: () => window.location.href = "/" },
          { label: "Backlog", active: true },
        ]}
      />
      <BacklogDashboard />
    </>
  )
}

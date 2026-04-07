"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"
import { useRouter } from "next/navigation"
import { DashboardHome } from "@/components/dashboard-home"
import { AddClientModal } from "@/components/add-client-modal"
import { ManageClientsSection } from "@/components/manage-clients-section"
import { TrendingUp, Target } from "lucide-react"

// Lazy load heavy components
const JourneyTimeline = lazy(() => import("@/components/journey-timeline").then(m => ({ default: m.JourneyTimeline })))
const CurrentPhaseCard = lazy(() => import("@/components/current-phase-card").then(m => ({ default: m.CurrentPhaseCard })))
const TodaysFocus = lazy(() => import("@/components/todays-focus").then(m => ({ default: m.TodaysFocus })))
const AnalyticsDashboard = lazy(() => import("@/components/analytics-dashboard").then(m => ({ default: m.AnalyticsDashboard })))
const ActivityFeed = lazy(() => import("@/components/activity-feed").then(m => ({ default: m.ActivityFeed })))
const WorkflowDashboard = lazy(() => import("@/components/workflow-dashboard").then(m => ({ default: m.WorkflowDashboard })))
const ContentVisibilityPage = lazy(() => import("@/app/content-visibility/page"))
const ContentTrackerPage = lazy(() => import("@/app/content-tracker/page"))
const MeetingsPage = lazy(() => import("@/app/meetings/page"))

const clientsFetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { selectedClientId, setSelectedClientId } = useClient()
  const [currentPhase, setCurrentPhase] = useState("my-tasks")
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showClientDetail, setShowClientDetail] = useState(false)
  const [showPostComposer, setShowPostComposer] = useState(false)
  const [clients, setClients] = useState([] as any[])
  
  // Redirect clients to their portal
  useEffect(() => {
    if (user?.role === 'client') {
      router.push('/client-portal')
    }
  }, [user, router])

  const { data: clientsData, mutate: mutateClients } = useSWR("/api/clients?limit=20", clientsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  useEffect(() => {
    if (clientsData?.clients) {
      setClients(clientsData.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        brandColor: c.brand_color || "#0071E3",
      })))
    }
  }, [clientsData])

  const handleAddClient = async (clientData: { name: string; description: string; brandColor?: string }) => {
    const tempClient = {
      id: `temp-${Date.now()}`,
      ...clientData,
    }
    setClients((prev) => [...prev, tempClient])
    setShowAddClientModal(false)

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clientData.name,
          description: clientData.description,
          brandColor: clientData.brandColor,
        }),
      })
      const data = await response.json()
      if (data.success && data.client) {
        mutateClients()
      }
    } catch (error) {
      mutateClients()
    }
  }

  const handleArchiveClient = async (clientId: string) => {
    setClients((prev) => prev.filter(c => c.id !== clientId))

    try {
      const token = localStorage.getItem("sessionToken")
      await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      })
      mutateClients()
    } catch (error) {
      mutateClients()
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC]">
        <TopNav hideClientSelector={currentPhase === "my-tasks"} />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {currentPhase === "overview" && (
                <DashboardHome
                  clients={clients}
                  selectedClientId={selectedClientId}
                  onClientSelect={(clientId) => {
                    setSelectedClientId(clientId)
                    setShowClientDetail(true)
                  }}
                />
              )}
              
              {currentPhase === "meetings" && (
                <Suspense fallback={<LoadingFallback />}>
                  <MeetingsPage />
                </Suspense>
              )}
              
              {currentPhase === "content-tracker" && (
                <Suspense fallback={<LoadingFallback />}>
                  <ContentTrackerPage />
                </Suspense>
              )}
              
              {currentPhase === "content-visibility" && (
                <Suspense fallback={<LoadingFallback />}>
                  <ContentVisibilityPage />
                </Suspense>
              )}
              
              {currentPhase === "manage-clients" && (
                <ManageClientsSection />
              )}
            </div>
          </main>
        </div>

        <AddClientModal isOpen={showAddClientModal} onClose={() => setShowAddClientModal(false)} onSubmit={handleAddClient} />
      </div>
    </AuthGuard>
  )
}

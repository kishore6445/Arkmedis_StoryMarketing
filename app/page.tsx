"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"
import { useRouter } from "next/navigation"
import { AddClientModal } from "@/components/add-client-modal"
import { ManageClientsSection } from "@/components/manage-clients-section"

// Lazy load all data-heavy components
const DashboardHome = lazy(() => import("@/components/dashboard-home").then(m => ({ default: m.DashboardHome })))
const MeetingsPage = lazy(() => import("@/app/meetings/page"))
const ContentTrackerPage = lazy(() => import("@/app/content-tracker/page"))
const ContentVisibilityPage = lazy(() => import("@/app/content-visibility/page"))

const clientsFetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

function EmptyDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-base text-muted-foreground">Loading your overview...</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
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
  const [currentPhase, setCurrentPhase] = useState("overview")
  const [showAddClientModal, setShowAddClientModal] = useState(false)
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
        <TopNav hideClientSelector={currentPhase === "overview"} />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {currentPhase === "overview" && (
                <Suspense fallback={<EmptyDashboard />}>
                  <DashboardHome
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onClientSelect={setSelectedClientId}
                  />
                </Suspense>
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

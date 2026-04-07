"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

// Lazy load all heavy components - they will NOT load until explicitly rendered
const TopNav = lazy(() => import("@/components/top-nav").then(m => ({ default: m.TopNav })))
const Sidebar = lazy(() => import("@/components/sidebar").then(m => ({ default: m.Sidebar })))
const AddClientModal = lazy(() => import("@/components/add-client-modal").then(m => ({ default: m.AddClientModal })))
const ManageClientsSection = lazy(() => import("@/components/manage-clients-section").then(m => ({ default: m.ManageClientsSection })))
const DashboardHome = lazy(() => import("@/components/dashboard-home").then(m => ({ default: m.DashboardHome })))
const MeetingsPage = lazy(() => import("@/app/meetings/page"))
const ContentTrackerPage = lazy(() => import("@/app/content-tracker/page"))
const ContentVisibilityPage = lazy(() => import("@/app/content-visibility/page"))

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

function DashboardContent() {
  const [currentPhase, setCurrentPhase] = useState("overview")
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Ensure we only render content after hydration to avoid data serialization issues
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <MinimalShell />
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
        <TopNav hideClientSelector={currentPhase === "overview"} />
      </Suspense>
      
      <div className="flex">
        <Suspense fallback={<div className="w-64 h-screen bg-gray-100 animate-pulse" />}>
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
        </Suspense>
        
        <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
          <div className="max-w-7xl mx-auto space-y-8">
            {currentPhase === "overview" && (
              <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading dashboard...</div>}>
                <DashboardHome 
                  clients={[]}
                  selectedClientId=""
                  onClientSelect={() => {}}
                />
              </Suspense>
            )}
            
            {currentPhase === "meetings" && (
              <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading meetings...</div>}>
                <MeetingsPage />
              </Suspense>
            )}
            
            {currentPhase === "content-tracker" && (
              <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading content tracker...</div>}>
                <ContentTrackerPage />
              </Suspense>
            )}
            
            {currentPhase === "content-visibility" && (
              <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading content visibility...</div>}>
                <ContentVisibilityPage />
              </Suspense>
            )}
            
            {currentPhase === "manage-clients" && (
              <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading clients...</div>}>
                <ManageClientsSection />
              </Suspense>
            )}
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <AddClientModal isOpen={showAddClientModal} onClose={() => setShowAddClientModal(false)} onSubmit={() => {}} />
      </Suspense>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect clients to their portal
  useEffect(() => {
    if (user?.role === 'client') {
      router.push('/client-portal')
    }
  }, [user, router])

  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

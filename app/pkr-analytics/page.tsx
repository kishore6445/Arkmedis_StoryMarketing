"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { PKRAnalyticsDashboard } from "@/components/pkr-analytics-dashboard"
import {
  calculateInternalPKR,
  calculateExternalPKR,
  calculateComprehensivePKR,
  type Task,
} from "@/lib/pkr-calculator"

type PKRRow = {
  id: string
  name: string
  pkrPercentage: number
  total: number
  kept: number
  atRisk: number
  missed: number
}

export default function PKRAnalyticsPage() {
  const [currentPhase, setCurrentPhase] = useState("account-manager")
  const [loading, setLoading] = useState(true)
  const [usersPKRData, setUsersPKRData] = useState<PKRRow[]>([])
  const [clientsPKRData, setClientsPKRData] = useState<PKRRow[]>([])
  const [overallPKR, setOverallPKR] = useState(0)
  const [internalPKR, setInternalPKR] = useState(0)
  const [externalPKR, setExternalPKR] = useState(0)
  const [totalPromises, setTotalPromises] = useState(0)
  const [keptPromises, setKeptPromises] = useState(0)
  const [atRiskPromises, setAtRiskPromises] = useState(0)
  const [missedPromises, setMissedPromises] = useState(0)
  const [totalInternalTasks, setTotalInternalTasks] = useState(0)
  const [keptInternalTasks, setKeptInternalTasks] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sessionToken")
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

        const [pkrRes, usersRes, clientsRes] = await Promise.all([
          fetch("/api/pkr/calculate?type=comprehensive", { headers }),
          fetch("/api/users", { headers }),
          fetch("/api/clients", { headers }),
        ])

        const [pkrData, usersData, clientsData] = await Promise.all([
          pkrRes.json(),
          usersRes.json(),
          clientsRes.json(),
        ])

        const allTasks: Task[] = pkrData.tasks || []
        const users: { id: string; full_name?: string; email?: string }[] = usersData.users || []
        const clients: { id: string; name: string }[] = clientsData.clients || []

        // Per-user internal PKR
        const uPKR: PKRRow[] = users
          .map((u) => {
            const tasks = allTasks.filter((t) => t.assigned_to === u.id)
            const m = calculateInternalPKR(tasks)
            return {
              id: u.id,
              name: u.full_name || u.email || "Unknown",
              pkrPercentage: m.pkr,
              total: m.total,
              kept: m.onTime,
              atRisk: m.overdue,
              missed: m.late,
            }
          })
          .filter((u) => u.total > 0)

        // Per-client external PKR
        const cPKR: PKRRow[] = clients
          .map((c) => {
            const tasks = allTasks.filter((t) => t.client_id === c.id)
            const m = calculateExternalPKR(tasks)
            return {
              id: c.id,
              name: c.name,
              pkrPercentage: m.pkr,
              total: m.total,
              kept: m.onTime,
              atRisk: m.overdueToClient ?? 0,
              missed: m.late,
            }
          })
          .filter((c) => c.total > 0)

        // Overall stats from comprehensive calculation
        // Overall stats from comprehensive calculation
        const overall = calculateComprehensivePKR(allTasks)
        const intMetrics = overall.internal   // due_date based (team)
        const extMetrics = overall.external   // promised_date based (client)
        const avgPKR = Math.round((intMetrics.pkr + extMetrics.pkr) / 2)

        setUsersPKRData(uPKR)
        setClientsPKRData(cPKR)
        setOverallPKR(avgPKR)
        setInternalPKR(Math.round(intMetrics.pkr))
        setExternalPKR(Math.round(extMetrics.pkr))
        // External (client-facing) for "promises" section
        setTotalPromises(extMetrics.total)
        setKeptPromises(extMetrics.onTime)
        setAtRiskPromises(extMetrics.overdueToClient ?? 0)
        setMissedPromises(extMetrics.late)
        // Internal (team commitment) for team section
        setTotalInternalTasks(intMetrics.total)
        setKeptInternalTasks(intMetrics.onTime)
      } catch (err) {
        console.error("[v0] PKR Analytics fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC]">
        <TopNav />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] mb-3">Company-Wide PKR Analytics</h1>
                <p className="text-lg text-[#86868B]">
                  Numbers-first comparison dashboard for tracking Promises Kept Ratio across users and clients. Filter, sort, and compare PKR metrics with precision.
                </p>
              </div>

              {/* Main Analytics Dashboard - Numbers First */}
              {loading ? (
                <div className="flex items-center justify-center py-24 text-[#86868B]">Loading PKR data…</div>
              ) : (
                <PKRAnalyticsDashboard
                  usersPKRData={usersPKRData}
                  clientsPKRData={clientsPKRData}
                  overallPKR={overallPKR}
                  internalPKR={internalPKR}
                  externalPKR={externalPKR}
                  totalPromises={totalPromises}
                  keptPromises={keptPromises}
                  atRiskPromises={atRiskPromises}
                  missedPromises={missedPromises}
                  totalInternalTasks={totalInternalTasks}
                  keptInternalTasks={keptInternalTasks}
                />
              )}

              {/* Footer Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900">
                <p className="font-semibold mb-2">About PKR (Promises Kept Ratio)</p>
                <p className="text-blue-800">
                  PKR measures the percentage of committed promises (tasks promised to be completed in a sprint) that are actually kept by the due date. 
                  A higher PKR indicates better commitment adherence and team reliability. Target: 90%+ for elite performance.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

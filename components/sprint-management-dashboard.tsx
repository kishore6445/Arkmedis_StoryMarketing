// "use client"

// import { useState } from "react"
// import useSWR from "swr"
// import { PlayCircle, CheckCircle2, Clock, Plus, ChevronDown } from "lucide-react"
// import { SprintCloseModal } from "./sprint-close-modal"
// import { cn } from "@/lib/utils"

// interface SprintTask {
//   id: string
//   task_id: string
//   title: string
//   status: "todo" | "in_progress" | "in_review" | "done"
// }

// interface BacklogTask {
//   id: string
//   task_id: string
//   title: string
//   status: string
//   promised_date: string
//   client_id: string
// }

// interface Sprint {
//   id: string
//   name: string
//   status: string
//   start_date: string
//   end_date: string
//   client_id: string
//   clients?: {
//     name: string
//   }
//   tasks?: SprintTask[]
// }

// const fetcher = (url: string) => {
//   const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
//   return fetch(url, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//   }).then((res) => res.json())
// }

// export function SprintManagementDashboard() {
//   const { data: sprintsData, isLoading, mutate } = useSWR("/api/sprints", fetcher, {
//     revalidateOnFocus: false,
//     dedupingInterval: 30000,
//   })
//   const { data: backlogData, mutate: mutateBacklog } = useSWR("/api/backlog", fetcher, {
//     revalidateOnFocus: false,
//     dedupingInterval: 30000,
//   })

//   const [selectedClient, setSelectedClient] = useState<string>("")
//   const [closeModalOpen, setCloseModalOpen] = useState(false)
//   const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
//   const [assigningTask, setAssigningTask] = useState<BacklogTask | null>(null)
//   const [assignToSprint, setAssignToSprint] = useState<string>("")
//   const [createNewSprint, setCreateNewSprint] = useState(false)
//   const [newSprintName, setNewSprintName] = useState("")

//   const sprints: Sprint[] = sprintsData?.sprints || []
//   const backlogTasks: BacklogTask[] = backlogData?.tasks || []

//   // Get unique clients
//   const uniqueClients = Array.from(
//     new Map(
//       sprints.map((s) => [
//         s.client_id,
//         s.clients?.name || `Client ${s.client_id?.substring(0, 8)}`,
//       ])
//     ).entries()
//   )

//   // Filter sprints by client
//   const filteredSprints = selectedClient
//     ? sprints.filter((s) => s.client_id === selectedClient)
//     : sprints

//   // Filter backlog by client
//   const filteredBacklog = selectedClient
//     ? backlogTasks.filter((t) => t.client_id === selectedClient)
//     : backlogTasks

//   // Sprints available for assignment (exclude completed)
//   const availableSprints = filteredSprints.filter((s) => s.status !== "completed")

//   // Group by status
//   const activeSprints = filteredSprints.filter((s) => s.status === "active")
//   const planningSprints = filteredSprints.filter((s) => s.status === "planning")
//   const completedSprints = filteredSprints.filter((s) => s.status === "completed")

//   const handleCloseSprint = (sprint: Sprint) => {
//     setSelectedSprint(sprint)
//     setCloseModalOpen(true)
//   }

//   const handleAssignTask = async () => {
//     if (!assigningTask) return
//     if (!assignToSprint && !newSprintName) {
//       alert("Please select a sprint or enter a name for a new sprint")
//       return
//     }

//     try {
//       const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
      
//       let sprintId = assignToSprint

//       // Create new sprint if needed
//       if (createNewSprint && newSprintName) {
//         const createResponse = await fetch("/api/sprints", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             name: newSprintName,
//             client_id: assigningTask.client_id,
//             status: "planning",
//             start_date: new Date().toISOString().split("T")[0],
//             end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
//           }),
//         })

//         if (createResponse.ok) {
//           const newSprint = await createResponse.json()
//           sprintId = newSprint.id
//         }
//       }

//       // Assign task to sprint
//       const assignResponse = await fetch("/api/tasks/assign", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           taskId: assigningTask.id,
//           sprintId: sprintId,
//         }),
//       })

//       if (assignResponse.ok) {
//         mutate()
//         mutateBacklog()
//         setAssigningTask(null)
//         setAssignToSprint("")
//         setNewSprintName("")
//         setCreateNewSprint(false)
//       }
//     } catch (error) {
//       console.error("[v0] Error assigning task:", error)
//       alert("Failed to assign task")
//     }
//   }

//   const getTaskStats = (sprint: Sprint) => {
//     const tasks = sprint.tasks || []
//     const completed = tasks.filter((t) => t.status === "done").length
//     const total = tasks.length
//     return { completed, total, pending: total - completed }
//   }

//   if (isLoading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-600">Loading sprints...</p>
//       </div>
//     )
//   }

//   const SprintCard = ({ sprint }: { sprint: Sprint }) => {
//     const { completed, total, pending } = getTaskStats(sprint)
//     const progress = total > 0 ? Math.round((completed / total) * 100) : 0

//     return (
//       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex items-start justify-between mb-4">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
//               <p className="text-sm text-gray-600 mt-1">
//                 {sprint.start_date} to {sprint.end_date}
//               </p>
//             </div>
//             <button
//               onClick={() => handleCloseSprint(sprint)}
//               className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
//             >
//               Close Sprint
//             </button>
//           </div>

//           {/* Progress Bar */}
//           <div className="space-y-2 mb-4">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium text-gray-700">Progress</span>
//               <span className="text-sm font-bold text-blue-600">{progress}%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//               <div
//                 className="bg-blue-600 h-full transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="grid grid-cols-3 gap-3">
//             <div className="bg-blue-50 rounded p-3">
//               <p className="text-xs text-gray-600 font-semibold">Total</p>
//               <p className="text-xl font-bold text-blue-600">{total}</p>
//             </div>
//             <div className="bg-green-50 rounded p-3">
//               <p className="text-xs text-gray-600 font-semibold">Done</p>
//               <p className="text-xl font-bold text-green-600">{completed}</p>
//             </div>
//             <div className="bg-amber-50 rounded p-3">
//               <p className="text-xs text-gray-600 font-semibold">Pending</p>
//               <p className="text-xl font-bold text-amber-600">{pending}</p>
//             </div>
//           </div>
//         </div>

//         {/* Tasks List */}
//         {(sprint.tasks || []).length > 0 && (
//           <div className="bg-gray-50 px-6 py-4">
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {(sprint.tasks || []).map((task) => (
//                 <div key={task.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
//                   <div className="pt-1">
//                     {task.status === "done" && (
//                       <CheckCircle2 className="w-4 h-4 text-green-600" />
//                     )}
//                     {task.status === "in_progress" && (
//                       <PlayCircle className="w-4 h-4 text-blue-600" />
//                     )}
//                     {task.status === "in_review" && (
//                       <Clock className="w-4 h-4 text-amber-600" />
//                     )}
//                     {!["done", "in_progress", "in_review"].includes(task.status) && (
//                       <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <span className="text-xs font-mono text-gray-500">{task.task_id}</span>
//                     <p className="text-sm text-gray-900 truncate">{task.title}</p>
//                   </div>
//                   <span
//                     className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
//                       task.status === "done"
//                         ? "bg-green-100 text-green-700"
//                         : task.status === "in_progress"
//                         ? "bg-blue-100 text-blue-700"
//                         : task.status === "in_review"
//                         ? "bg-amber-100 text-amber-700"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {task.status === "done"
//                       ? "Done"
//                       : task.status === "in_progress"
//                       ? "In Progress"
//                       : task.status === "in_review"
//                       ? "Review"
//                       : "Pending"}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {(sprint.tasks || []).length === 0 && (
//           <div className="bg-gray-50 px-6 py-4 text-center">
//             <p className="text-sm text-gray-600">No tasks in this sprint</p>
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="p-8 space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Sprint Management</h1>
//         <p className="text-gray-600 mt-2">
//           Close sprints and migrate pending tasks to backlog or new sprint
//         </p>
//       </div>

//       {/* Client Dropdown */}
//       <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
//         <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
//           Select Client:
//         </label>
//         <select
//           value={selectedClient}
//           onChange={(e) => {
//             setSelectedClient(e.target.value)
//             setCloseModalOpen(false)
//           }}
//           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Clients ({sprints.length} sprints)</option>
//           {uniqueClients.map(([clientId, clientName]) => {
//             const count = sprints.filter((s) => s.client_id === clientId).length
//             return (
//               <option key={clientId} value={clientId}>
//                 {clientName} ({count})
//               </option>
//             )
//           })}
//         </select>
//       </div>

//       {/* Empty State */}
//       {!isLoading && filteredSprints.length === 0 && (
//         <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
//           <p className="text-gray-600">No sprints found</p>
//         </div>
//       )}

//       {/* Active Sprints */}
//       {!isLoading && activeSprints.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold text-gray-900">Active Sprints</h2>
//           {activeSprints.map((sprint) => (
//             <SprintCard key={sprint.id} sprint={sprint} />
//           ))}
//         </div>
//       )}

//       {/* Planning Sprints */}
//       {!isLoading && planningSprints.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold text-gray-900">Planning</h2>
//           {planningSprints.map((sprint) => (
//             <SprintCard key={sprint.id} sprint={sprint} />
//           ))}
//         </div>
//       )}

//       {/* Completed Sprints */}
//       {!isLoading && completedSprints.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold text-gray-900">Completed</h2>
//           {completedSprints.map((sprint) => (
//             <SprintCard key={sprint.id} sprint={sprint} />
//           ))}
//         </div>
//       )}

//       {/* Backlog Section */}
//       <div className="border-t pt-8">
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Backlog ({filteredBacklog.length})</h2>
        
//         {filteredBacklog.length === 0 ? (
//           <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
//             <p className="text-gray-600">No items in backlog</p>
//           </div>
//         ) : (
//           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//             <div className="space-y-0">
//               {filteredBacklog.map((task) => (
//                 <div
//                   key={task.id}
//                   className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex-1 min-w-0">
//                     <span className="text-xs font-mono text-gray-500">{task.task_id}</span>
//                     <p className="font-medium text-gray-900">{task.title}</p>
//                     <p className="text-sm text-gray-600">Due: {task.promised_date}</p>
//                   </div>
//                   <button
//                     onClick={() => setAssigningTask(task)}
//                     className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium text-sm whitespace-nowrap transition-colors"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Assign to Sprint
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Assign Task Modal */}
//       {assigningTask && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Assign Task to Sprint</h3>
//               <p className="text-sm text-gray-600 mt-1">{assigningTask.task_id}: {assigningTask.title}</p>
//             </div>

//             <div className="p-6 space-y-4">
//               {/* Existing Sprints */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Select Existing Sprint
//                 </label>
//                 <select
//                   value={assignToSprint}
//                   onChange={(e) => {
//                     setAssignToSprint(e.target.value)
//                     setCreateNewSprint(false)
//                     setNewSprintName("")
//                   }}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Choose a sprint...</option>
//                   {availableSprints.map((sprint) => (
//                     <option key={sprint.id} value={sprint.id}>
//                       {sprint.name} ({sprint.status})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Or Create New */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-gray-500">or</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <input
//                     type="checkbox"
//                     checked={createNewSprint}
//                     onChange={(e) => setCreateNewSprint(e.target.checked)}
//                     className="mr-2"
//                   />
//                   Create New Sprint
//                 </label>
//                 {createNewSprint && (
//                   <input
//                     type="text"
//                     value={newSprintName}
//                     onChange={(e) => setNewSprintName(e.target.value)}
//                     placeholder="Sprint name (e.g., Mar 25-31)"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 )}
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex gap-3">
//               <button
//                 onClick={() => {
//                   setAssigningTask(null)
//                   setAssignToSprint("")
//                   setNewSprintName("")
//                   setCreateNewSprint(false)
//                 }}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAssignTask}
//                 disabled={!assignToSprint && !newSprintName}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
//               >
//                 Assign
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Close Sprint Modal */}
//       <SprintCloseModal
//         isOpen={closeModalOpen && !!selectedSprint}
//         onClose={() => {
//           console.log("[v0] Closing sprint modal")
//           setCloseModalOpen(false)
//           setSelectedSprint(null)
//         }}
//         sprint={selectedSprint}
//         tasks={
//           selectedSprint?.tasks?.map((t) => ({
//             id: t.id,
//             title: t.title,
//             status: t.status as "todo" | "in-progress" | "in-review" | "done",
//           })) || []
//         }
//         sprints={sprints.map((s) => ({ id: s.id, name: s.name }))}
//         onSprintClosed={() => {
//           console.log("[v0] Sprint closed successfully, refreshing data")
//           setCloseModalOpen(false)
//           setSelectedSprint(null)
//           mutate()
//         }}
//       />
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import useSWR from "swr"
import { PlayCircle, CheckCircle2, Clock, Plus, ChevronDown, X } from "lucide-react"
import { SprintCloseModal } from "./sprint-close-modal"
import { cn } from "@/lib/utils"

interface SprintTask {
  id: string
  task_id: string
  title: string
  status: "todo" | "in_progress" | "in_review" | "done"
}

interface BacklogTask {
  id: string
  task_id: string
  title: string
  status: string
  promised_date: string
  client_id: string
}

interface Sprint {
  id: string
  name: string
  status: string
  start_date: string
  end_date: string
  client_id: string
  clients?: {
    name: string
  }
  tasks?: SprintTask[]
}

interface ClientOption {
  id: string
  name: string
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json())
}

export function SprintManagementDashboard() {
  const { data: sprintsData, isLoading, mutate } = useSWR("/api/sprints", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })
  const { data: clientsData } = useSWR("/api/clients", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })
  const { data: backlogData, mutate: mutateBacklog } = useSWR("/api/backlog", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const [selectedClient, setSelectedClient] = useState<string>("")
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [assigningTask, setAssigningTask] = useState<BacklogTask | null>(null)
  const [assignToSprint, setAssignToSprint] = useState<string>("")
  const [createNewSprint, setCreateNewSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState("")
  const [createSprintModalOpen, setCreateSprintModalOpen] = useState(false)
  const [sprintFormData, setSprintFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })
  const [isCreatingSprint, setIsCreatingSprint] = useState(false)

  const sprints: Sprint[] = sprintsData?.sprints || []
  const clients: ClientOption[] = clientsData?.clients || []
  const backlogTasks: BacklogTask[] = backlogData?.tasks || []

  const clientOptions = clients.map((client) => [client.id, client.name] as const)

  // Filter sprints by client
  const filteredSprints = selectedClient
    ? sprints.filter((s) => s.client_id === selectedClient)
    : sprints

  // Filter backlog by client
  const filteredBacklog = selectedClient
    ? backlogTasks.filter((t) => t.client_id === selectedClient)
    : backlogTasks

  // Sprints available for assignment (exclude completed)
  const availableSprints = filteredSprints.filter((s) => s.status !== "completed")

  // Group by status
  const activeSprints = filteredSprints.filter((s) => s.status === "active")
  const planningSprints = filteredSprints.filter((s) => s.status === "planning")
  const completedSprints = filteredSprints.filter((s) => s.status === "completed")

  const handleCloseSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setCloseModalOpen(true)
  }

  const handleCreateSprintSubmit = async () => {
    if (!sprintFormData.name.trim() || !selectedClient) {
      alert("Please select a client and enter sprint name")
      return
    }

    setIsCreatingSprint(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/clients/${selectedClient}/sprints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sprintFormData.name,
          start_date: sprintFormData.startDate,
          end_date: sprintFormData.endDate,
          status: "planning",
        }),
      })

      if (response.ok) {
        mutate()
        setCreateSprintModalOpen(false)
        setSprintFormData({
          name: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
      } else {
        const errorData = await response.json().catch(() => null)
        alert(errorData?.error || "Failed to create sprint")
      }
    } catch (error) {
      console.error("[v0] Error creating sprint:", error)
      alert("Failed to create sprint")
    } finally {
      setIsCreatingSprint(false)
    }
  }

  const handleAssignTask = async () => {
    if (!assigningTask) return
    if (!assignToSprint && !newSprintName) {
      alert("Please select a sprint or enter a name for a new sprint")
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
      
      let sprintId = assignToSprint

      // Create new sprint if needed
      if (createNewSprint && newSprintName) {
        const createResponse = await fetch(`/api/clients/${assigningTask.client_id}/sprints`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newSprintName,
            status: "planning",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          }),
        })

        if (createResponse.ok) {
          const newSprint = await createResponse.json()
          sprintId = newSprint.id
        } else {
          const errorData = await createResponse.json().catch(() => null)
          alert(errorData?.error || "Failed to create sprint")
          return
        }
      }

      // Assign task to sprint
      const assignResponse = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: assigningTask.id,
          sprintId: sprintId,
        }),
      })

      if (assignResponse.ok) {
        mutate()
        mutateBacklog()
        setAssigningTask(null)
        setAssignToSprint("")
        setNewSprintName("")
        setCreateNewSprint(false)
      }
    } catch (error) {
      console.error("[v0] Error assigning task:", error)
      alert("Failed to assign task")
    }
  }

  const getTaskStats = (sprint: Sprint) => {
    const tasks = sprint.tasks || []
    const completed = tasks.filter((t) => t.status === "done").length
    const total = tasks.length
    return { completed, total, pending: total - completed }
  }

  const SprintCard = ({ sprint }: { sprint: Sprint }) => {
    const { completed, total, pending } = getTaskStats(sprint)
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {sprint.start_date} to {sprint.end_date}
              </p>
            </div>
            <button
              onClick={() => handleCloseSprint(sprint)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
            >
              Close Sprint
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <p className="text-xl font-bold text-blue-600">{total}</p>
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-gray-600 font-semibold">Done</p>
              <p className="text-xl font-bold text-green-600">{completed}</p>
            </div>
            <div className="bg-amber-50 rounded p-3">
              <p className="text-xs text-gray-600 font-semibold">Pending</p>
              <p className="text-xl font-bold text-amber-600">{pending}</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {(sprint.tasks || []).length > 0 && (
          <div className="bg-gray-50 px-6 py-4">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(sprint.tasks || []).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                  <div className="pt-1">
                    {task.status === "done" && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    {task.status === "in_progress" && (
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                    )}
                    {task.status === "in_review" && (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    {!["done", "in_progress", "in_review"].includes(task.status) && (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-gray-500">{task.task_id}</span>
                    <p className="text-sm text-gray-900 truncate">{task.title}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                      task.status === "done"
                        ? "bg-green-100 text-green-700"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : task.status === "in_review"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status === "done"
                      ? "Done"
                      : task.status === "in_progress"
                      ? "In Progress"
                      : task.status === "in_review"
                      ? "Review"
                      : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(sprint.tasks || []).length === 0 && (
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-600">No tasks in this sprint</p>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading sprints...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sprint Management</h1>
        <p className="text-gray-600 mt-2">
          Close sprints and migrate pending tasks to backlog or new sprint
        </p>
      </div>

      {/* Client Dropdown & Create Sprint Button */}
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          Select Client:
        </label>
        <select
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value)
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Clients</option>
          {clientOptions.map(([clientId, clientName]) => (
            <option key={clientId} value={clientId}>
              {clientName}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCreateSprintModalOpen(true)}
          disabled={!selectedClient}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Sprint
        </button>
      </div>

      {/* Empty State */}
      {!isLoading && filteredSprints.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No sprints found</p>
        </div>
      )}

      {/* Active Sprints */}
      {!isLoading && activeSprints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Active Sprints</h2>
          {activeSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      )}

      {/* Planning Sprints */}
      {!isLoading && planningSprints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Planning</h2>
          {planningSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      )}

      {/* Completed Sprints */}
      {!isLoading && completedSprints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Completed</h2>
          {completedSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      )}

      {/* Backlog Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Backlog ({filteredBacklog.length})</h2>
        
        {filteredBacklog.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No items in backlog</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="space-y-0">
              {filteredBacklog.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-gray-500">{task.task_id}</span>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">Due: {task.promised_date}</p>
                  </div>
                  <button
                    onClick={() => setAssigningTask(task)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium text-sm whitespace-nowrap transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Assign to Sprint
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {assigningTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Task to Sprint</h3>
              <p className="text-sm text-gray-600 mt-1">{assigningTask.task_id}: {assigningTask.title}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing Sprints */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Existing Sprint
                </label>
                <select
                  value={assignToSprint}
                  onChange={(e) => {
                    setAssignToSprint(e.target.value)
                    setCreateNewSprint(false)
                    setNewSprintName("")
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a sprint...</option>
                  {availableSprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Create New */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={createNewSprint}
                    onChange={(e) => setCreateNewSprint(e.target.checked)}
                    className="mr-2"
                  />
                  Create New Sprint
                </label>
                {createNewSprint && (
                  <input
                    type="text"
                    value={newSprintName}
                    onChange={(e) => setNewSprintName(e.target.value)}
                    placeholder="Sprint name (e.g., Mar 25-31)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setAssigningTask(null)
                  setAssignToSprint("")
                  setNewSprintName("")
                  setCreateNewSprint(false)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={!assignToSprint && !newSprintName}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Sprint Modal */}
      <SprintCloseModal
        isOpen={closeModalOpen && !!selectedSprint}
        onClose={() => {
          console.log("[v0] Closing sprint modal")
          setCloseModalOpen(false)
          setSelectedSprint(null)
        }}
        sprint={selectedSprint}
        tasks={
          selectedSprint?.tasks?.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status as "todo" | "in-progress" | "in-review" | "done",
          })) || []
        }
        sprints={sprints.map((s) => ({ id: s.id, name: s.name }))}
        onSprintClosed={() => {
          console.log("[v0] Sprint closed successfully, refreshing data")
          setCloseModalOpen(false)
          setSelectedSprint(null)
          mutate()
          mutateBacklog()
        }}
      />

      {/* Create Sprint Modal */}
      {createSprintModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Sprint</h3>
              <button
                onClick={() => setCreateSprintModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sprint Name
                </label>
                <input
                  type="text"
                  value={sprintFormData.name}
                  onChange={(e) =>
                    setSprintFormData({ ...sprintFormData, name: e.target.value })
                  }
                  placeholder="e.g., Mar 25 - Apr 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={sprintFormData.startDate}
                  onChange={(e) =>
                    setSprintFormData({ ...sprintFormData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={sprintFormData.endDate}
                  onChange={(e) =>
                    setSprintFormData({ ...sprintFormData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setCreateSprintModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSprintSubmit}
                disabled={isCreatingSprint}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingSprint ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sprint"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

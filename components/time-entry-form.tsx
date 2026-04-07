import { useState } from "react"
import { Plus, Loader } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeEntryFormProps {
  clients: Array<{ id: string; name: string }>
  sprints: Array<{ id: string; name: string }>
  tasks: Array<{ id: string; title: string }>
  filteredSprints: Array<{ id: string; name: string }>
  filteredTasks: Array<{ id: string; title: string }>
  onClientChange: (clientId: string) => void
  onSprintChange: (sprintId: string) => void
  onTaskChange: (taskId: string) => void
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  clientId?: string
  sprintId?: string
  taskId?: string
}

export function TimeEntryForm({
  clients,
  filteredSprints,
  filteredTasks,
  onClientChange,
  onSprintChange,
  onTaskChange,
  onSubmit,
  isLoading,
  clientId,
  sprintId,
  taskId,
}: TimeEntryFormProps) {
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!clientId || !sprintId || !taskId || !hours || !description.trim()) {
      setError("All fields are required")
      return
    }

    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum < 0.25 || hoursNum > 10) {
      setError("Hours must be between 0.25 and 10")
      return
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        client_id: clientId,
        sprint_id: sprintId,
        task_id: taskId,
        hours: hoursNum,
        description,
      })

      // Reset form
      setHours("")
      setDescription("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E5E5E7] p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">Add Time Entry</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
            Client
          </label>
          <select
            value={clientId || ""}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
            Sprint
          </label>
          <select
            value={sprintId || ""}
            onChange={(e) => onSprintChange(e.target.value)}
            disabled={!clientId}
            className={cn(
              "w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm",
              !clientId && "bg-[#F5F5F7] cursor-not-allowed opacity-50"
            )}
          >
            <option value="">Select a sprint</option>
            {filteredSprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
            Task
          </label>
          <select
            value={taskId || ""}
            onChange={(e) => onTaskChange(e.target.value)}
            disabled={!sprintId}
            className={cn(
              "w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm",
              !sprintId && "bg-[#F5F5F7] cursor-not-allowed opacity-50"
            )}
          >
            <option value="">Select a task</option>
            {filteredTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        {/* Hours Input */}
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
            Hours (0.25 - 10)
          </label>
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="10"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm"
            placeholder="e.g. 2.5"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
          Work Description (min 10 characters)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm resize-none"
          rows={3}
          placeholder="Describe the work you completed..."
        />
        <div className="text-xs text-[#86868B] mt-1">
          {description.length} / 10 characters
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex items-center gap-2 flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium text-sm transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Entry
            </>
          )}
        </button>
      </div>
    </form>
  )
}

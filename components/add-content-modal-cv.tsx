"use client"

import { useEffect, useState } from "react"
import { X, Upload } from "lucide-react"
import { CONTENT_STATUS_OPTIONS, type ContentRecordFormValues } from "@/lib/content-records"
import { TargetProgressIndicator } from "./target-progress-indicator"
import type { Platform } from "@/lib/platform-targets-service"

interface AddContentModalProps {
  onClose: () => void
  onSuccess: () => void
  initialData?: ContentRecordFormValues | null
}

type ClientOption = {
  id: string
  name: string
}

type UserOption = {
  id: string
  full_name: string | null
}

const EMPTY_FORM: ContentRecordFormValues = {
  clientId: "",
  month: "",
  week: "",
  title: "",
  contentType: "",
  platform: "",
  plannedDate: "",
  scheduledDate: "",
  publishedDate: "",
  ownerId: "",
  status: "planned",
  notes: "",
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
const CONTENT_TYPES = ["Reel", "Carousel", "Post", "Blog", "Email", "Video", "Newsletter", "Case Study"]
const PLATFORMS = ["Instagram", "LinkedIn", "YouTube", "Blog", "Email", "Facebook", "X", "Website"]

export default function AddContentModal({ onClose, onSuccess, initialData }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    ...initialData,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [owners, setOwners] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(initialData?.id)

  useEffect(() => {
    setFormData({
      ...EMPTY_FORM,
      ...initialData,
    })
    setSelectedFile(null)
  }, [initialData])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("sessionToken")
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined

        const [clientsResponse, usersResponse] = await Promise.all([
          fetch("/api/clients", { headers }),
          fetch("/api/users", { headers }),
        ])

        if (!clientsResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to load form options")
        }

        const clientsData = await clientsResponse.json()
        const usersData = await usersResponse.json()

        setClients(clientsData.clients || [])
        setOwners(usersData.users || [])
      } catch (loadError) {
        console.error("[v0] Failed to load Add Content options:", loadError)
        setError(loadError instanceof Error ? loadError.message : "Failed to load form options")
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      let attachmentPayload = {
        attachmentUrl: formData.attachmentUrl || "",
        attachmentName: formData.attachmentName || "",
        attachmentType: formData.attachmentType || "",
        attachmentSize: formData.attachmentSize || 0,
      }

      if (selectedFile) {
        const uploadData = new FormData()
        uploadData.append("file", selectedFile)
        uploadData.append("clientId", formData.clientId || "unassigned-client")
        uploadData.append("sectionId", "content-records")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        })

        const uploadResult = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || "Failed to upload attachment")
        }

        attachmentPayload = {
          attachmentUrl: uploadResult.url || "",
          attachmentName: uploadResult.filename || selectedFile.name,
          attachmentType: uploadResult.type || selectedFile.type,
          attachmentSize: uploadResult.size || selectedFile.size,
        }
      }

      const payload = isEditing
        ? formData
        : {
            ...formData,
            status: "planned",
            scheduledDate: "",
            publishedDate: "",
          }

      const finalPayload = {
        ...payload,
        ...attachmentPayload,
      }

      const token = localStorage.getItem("sessionToken")
      const response = await fetch(isEditing ? `/api/content/records/${initialData?.id}` : "/api/content/records", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(finalPayload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to save content")
      }

      onSuccess()
    } catch (submitError) {
      console.error("[v0] Failed to save content:", submitError)
      setError(submitError instanceof Error ? submitError.message : "Failed to save content")
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const monthOptions = MONTHS.map((month) => ({ value: month, label: month.charAt(0).toUpperCase() + month.slice(1) }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Content" : "Add Content"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-600">Loading form options...</div>
          ) : (
          <>
          <div className="grid grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a month</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Week *</label>
              <select
                name="week"
                value={formData.week}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a week</option>
                {WEEKS.map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Founder Story Reel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Type *</label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select content type</option>
                {CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform *</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select platform</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Planned Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Planned Date *</label>
              <input
                type="date"
                name="plannedDate"
                value={formData.plannedDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Target Progress Indicator - New */}
          {formData.clientId && formData.platform && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <TargetProgressIndicator
                clientId={formData.clientId}
                platform={formData.platform as Platform}
                currentCount={1}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner *</label>
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name || owner.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Publishing Lifecycle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Published Date</label>
                  <input
                    type="date"
                    name="publishedDate"
                    value={formData.publishedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CONTENT_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">File Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
              <input
                id="content-attachment"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <label htmlFor="content-attachment" className="cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Click to choose a file</p>
                <p className="text-xs text-gray-500 mt-1">Max size 50MB</p>
              </label>

              {selectedFile && (
                <p className="text-xs text-gray-700 mt-3">
                  Selected: {selectedFile.name}
                </p>
              )}

              {!selectedFile && formData.attachmentName && (
                <p className="text-xs text-gray-700 mt-3">
                  Current file: {formData.attachmentName}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ml-auto disabled:opacity-60"
            >
              {saving ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Add Content"}
            </button>
          </div>
          </>
          )}
        </form>
      </div>
    </div>
  )
}

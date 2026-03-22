"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (content: any) => void
  contentData: any[]
}

export function AddContentModal({ isOpen, onClose, onAdd, contentData }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    client: "",
    title: "",
    platform: "",
    contentType: "",
    plannedDate: "",
    postedDate: "",
    status: "Pending",
    owner: "",
    postLink: "",
    notes: "",
  })

  const clients = Array.from(new Set(contentData.map((d) => d.client)))
  const platforms = Array.from(new Set(contentData.map((d) => d.platform)))
  const owners = Array.from(new Set(contentData.map((d) => d.owner)))
  const contentTypes = ["Article", "Video", "Carousel", "Newsletter", "PDF", "Image", "Infographic", "Case Study"]
  const statuses = ["Planned", "Scheduled", "Posted", "Pending", "Missed", "Paused"]

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!formData.client || !formData.title || !formData.platform) {
      alert("Please fill in required fields")
      return
    }
    onAdd(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add New Content</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Content Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Product Launch"
                required
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Planned Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Planned Date</label>
              <input
                type="date"
                name="plannedDate"
                value={formData.plannedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Posted Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Posted Date</label>
              <input
                type="date"
                name="postedDate"
                value={formData.postedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Owner</label>
              <select
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Post Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Post Link</label>
            <input
              type="url"
              name="postLink"
              value={formData.postLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Any additional notes or details..."
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Add Content
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

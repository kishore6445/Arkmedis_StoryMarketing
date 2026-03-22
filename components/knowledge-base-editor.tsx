'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KnowledgeBaseEditorProps {
  isOpen: boolean
  parentId?: string
  onClose: () => void
  onSave: (data: {
    title: string
    content: string
    type: 'decision' | 'action-item' | 'insight' | 'topic'
    tags: string[]
  }) => void
}

export default function KnowledgeBaseEditor({
  isOpen,
  parentId,
  onClose,
  onSave,
}: KnowledgeBaseEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'topic' as const,
    tags: [] as string[],
    tagInput: '',
  })

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      })
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    onSave({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      tags: formData.tags,
    })

    setFormData({
      title: '',
      content: '',
      type: 'topic',
      tags: [],
      tagInput: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Add to Knowledge Base</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter topic title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['decision', 'action-item', 'insight', 'topic'].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: type as 'decision' | 'action-item' | 'insight' | 'topic',
                    })
                  }
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors',
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {type === 'action-item' ? 'Action Item' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Details</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Add detailed information..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag and press Enter..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save to Knowledge Base
          </button>
        </div>
      </div>
    </div>
  )
}

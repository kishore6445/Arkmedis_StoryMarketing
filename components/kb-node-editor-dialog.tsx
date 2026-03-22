"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import type { KBNode } from "./kb-outline-tree"

interface NodeEditorDialogProps {
  isOpen: boolean
  node: KBNode | null
  isNew?: boolean
  onClose: () => void
  onSave: (node: KBNode) => void
}

export function NodeEditorDialog({
  isOpen,
  node,
  isNew,
  onClose,
  onSave,
}: NodeEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<KBNode>>({
    title: "",
    content: "",
    type: "task",
    priority: "medium",
    tags: [],
    dueDate: "",
  })

  useEffect(() => {
    if (node) {
      setFormData({
        id: node.id,
        title: node.title,
        content: node.content,
        type: node.type,
        priority: node.priority,
        tags: node.tags,
        dueDate: node.dueDate,
        assignee: node.assignee,
      })
    } else {
      setFormData({
        title: "",
        content: "",
        type: "task",
        priority: "medium",
        tags: [],
        dueDate: "",
      })
    }
  }, [node, isOpen])

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert("Title is required")
      return
    }

    const newNode: KBNode = {
      id: formData.id || `node-${Date.now()}`,
      title: formData.title,
      content: formData.content || "",
      type: (formData.type as any) || "task",
      priority: (formData.priority as any),
      tags: formData.tags || [],
      dueDate: formData.dueDate,
      assignee: formData.assignee,
      createdAt: node?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(newNode)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create New Item" : "Edit Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Item title"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Item description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type || "task"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="task">Task</option>
                <option value="note">Note</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority || "medium"}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate || ""}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <Input
              value={formData.tags?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                })
              }
              placeholder="tag1, tag2, tag3"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {isNew ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

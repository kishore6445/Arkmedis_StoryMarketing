export const CONTENT_STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "missed", label: "Missed" },
  { value: "paused", label: "Paused" },
] as const

export type ContentStatus = (typeof CONTENT_STATUS_OPTIONS)[number]["value"]

export type ContentRecordFormValues = {
  id?: string
  clientId: string
  month: string
  week: string
  title: string
  contentType: string
  platform: string
  plannedDate: string
  scheduledDate: string
  publishedDate: string
  ownerId: string
  status: ContentStatus
  notes: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: string
  attachmentSize?: number
}

export type ContentRecordListItem = ContentRecordFormValues & {
  id: string
  client: string
  owner: string
  createdAt?: string
  updatedAt?: string
}

export function toStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}
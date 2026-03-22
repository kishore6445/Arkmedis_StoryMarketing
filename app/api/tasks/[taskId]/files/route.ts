import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ taskId?: string | string[] }> | { taskId?: string | string[] }
}

type TaskFileRow = {
  id: string
  task_id: string
  name: string
  url: string
  size: number
  mime_type: string | null
  uploaded_by: string
  uploaded_at: string
}

type UserRow = {
  id: string
  full_name: string | null
  email: string | null
}

async function resolveTaskId(request: NextRequest, context: RouteContext) {
  const resolvedParams = await Promise.resolve(context.params)
  const routeParam = resolvedParams?.taskId

  if (typeof routeParam === "string" && routeParam.trim()) {
    return routeParam.trim()
  }

  if (Array.isArray(routeParam)) {
    const firstValue = routeParam.find((value) => typeof value === "string" && value.trim())
    if (firstValue) {
      return firstValue.trim()
    }
  }

  const pathnameParts = request.nextUrl.pathname.split("/").filter(Boolean)
  const taskIdIndex = pathnameParts.findIndex((part) => part === "tasks") + 1
  const taskIdFromPath = pathnameParts[taskIdIndex]

  return typeof taskIdFromPath === "string" ? taskIdFromPath.trim() : ""
}

// GET - Fetch files for a task
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const taskId = await resolveTaskId(request, context)

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    console.log("[v0] Fetching files for task:", taskId)

    const { data: files, error } = await supabase
      .from("task_files")
      .select(`
        id,
        task_id,
        name,
        url,
        size,
        mime_type,
        uploaded_by,
        uploaded_at
      `)
      .eq("task_id", taskId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching files:", error)
      return NextResponse.json([])
    }

    // Enrich files with user data
    let enrichedFiles: Array<TaskFileRow & { uploaded_by_user?: UserRow }> = (files as TaskFileRow[] | null) || []
    if (enrichedFiles.length > 0) {
      const userIds = [...new Set(enrichedFiles.map(f => f.uploaded_by))]
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      const typedUsers = (users as UserRow[] | null) || []

      enrichedFiles = enrichedFiles.map(file => ({
        ...file,
        uploaded_by_user: typedUsers.find(u => u.id === file.uploaded_by) || { id: file.uploaded_by, full_name: "Unknown", email: "" }
      }))
    }

    return NextResponse.json(enrichedFiles)
  } catch (error) {
    console.error("[v0] Error in files GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Upload a file to a task
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const taskId = await resolveTaskId(request, context)

    console.log("[v0] Resolved task ID for file upload:", {
      pathname: request.nextUrl.pathname,
      taskId,
    })

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const { data: existingTask, error: taskLookupError } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", taskId)
      .maybeSingle()

    if (taskLookupError) {
      console.error("[v0] Error validating task before file upload:", taskLookupError)
      return NextResponse.json({ error: "Failed to validate task", details: taskLookupError.message }, { status: 500 })
    }

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log("[v0] Uploading file:", file.name, "for task:", taskId)

    // Upload file to storage
    const fileName = `${taskId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("task-files")
      .upload(fileName, file)

    if (uploadError) {
      console.error("[v0] Error uploading file:", uploadError)
      return NextResponse.json({ error: "Failed to upload file", details: uploadError.message }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("task-files")
      .getPublicUrl(fileName)

    // Save file metadata to database
    const taskFilesTable = supabase.from("task_files") as any

    const { data: fileRecord, error: dbError } = await (taskFilesTable
      .insert({
        task_id: taskId,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        mime_type: file.type,
        uploaded_by: session.userId,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()) as { data: TaskFileRow | null; error: { message: string } | null }

    if (dbError) {
      console.error("[v0] Error saving file metadata:", dbError)
      return NextResponse.json({ error: "Failed to save file metadata", details: dbError.message }, { status: 400 })
    }

    return NextResponse.json(fileRecord, { status: 201 })
  } catch (error) {
    console.error("[v0] Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

// DELETE - Remove a file from a task
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")
    const taskId = await resolveTaskId(request, context)

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    console.log("[v0] Deleting file:", fileId)

    // Get file record to find storage path
    const { data: fileRecord, error: fetchError } = await (supabase
      .from("task_files")
      .select("url")
      .eq("id", fileId)
      .single()) as { data: Pick<TaskFileRow, "url"> | null; error: { message: string } | null }

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Extract file path from URL
    const url = new URL(fileRecord.url)
    const filePath = url.pathname.split("/object/public/task-files/")[1]

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("task-files")
      .remove([filePath])

    if (storageError) {
      console.error("[v0] Error deleting file from storage:", storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("task_files")
      .delete()
      .eq("id", fileId)

    if (dbError) {
      console.error("[v0] Error deleting file record:", dbError)
      return NextResponse.json({ error: "Failed to delete file", details: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting file:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

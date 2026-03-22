import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch files for a task
export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
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
    const taskId = params.taskId

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
    let enrichedFiles = files || []
    if (enrichedFiles.length > 0) {
      const userIds = [...new Set(enrichedFiles.map(f => f.uploaded_by))]
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      enrichedFiles = enrichedFiles.map(file => ({
        ...file,
        uploaded_by_user: users?.find(u => u.id === file.uploaded_by) || { id: file.uploaded_by, full_name: "Unknown", email: "" }
      }))
    }

    return NextResponse.json(enrichedFiles)
  } catch (error) {
    console.error("[v0] Error in files GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Upload a file to a task
export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
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
    const taskId = params.taskId

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
    const { data: fileRecord, error: dbError } = await supabase
      .from("task_files")
      .insert({
        task_id: taskId,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        mime_type: file.type,
        uploaded_by: session.id,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

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
export async function DELETE(request: NextRequest, { params }: { params: { taskId: string } }) {
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

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    console.log("[v0] Deleting file:", fileId)

    // Get file record to find storage path
    const { data: fileRecord, error: fetchError } = await supabase
      .from("task_files")
      .select("url")
      .eq("id", fileId)
      .single()

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

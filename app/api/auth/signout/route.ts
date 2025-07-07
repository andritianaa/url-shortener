import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (token) {
      await deleteSession(token)
    }

    cookieStore.delete("session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

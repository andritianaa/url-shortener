import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.user.count()

    return NextResponse.json({
      signupAllowed: userCount === 0,
      isFirstUser: userCount === 0,
    })
  } catch (error) {
    console.error("Check signup error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

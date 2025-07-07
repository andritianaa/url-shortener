import type { NextRequest } from "next/server"

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip || "unknown"
}

export async function getLocationFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    // Utiliser un service de géolocalisation IP gratuit
    const response = await fetch(`http://ip-api.com/json/${ip}`)
    const data = await response.json()

    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
      }
    }
  } catch (error) {
    console.error("Error getting location from IP:", error)
  }

  return {}
}

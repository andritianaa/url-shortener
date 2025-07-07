export function parseUserAgent(userAgent: string): { device?: string; browser?: string; os?: string } {
  const device = getDevice(userAgent)
  const browser = getBrowser(userAgent)
  const os = getOS(userAgent)

  return { device, browser, os }
}

function getDevice(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) return "Tablet"
    return "Mobile"
  }
  return "Desktop"
}

function getBrowser(userAgent: string): string {
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return "Chrome"
  if (/Firefox/.test(userAgent)) return "Firefox"
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return "Safari"
  if (/Edge/.test(userAgent)) return "Edge"
  if (/Opera/.test(userAgent)) return "Opera"
  return "Other"
}

function getOS(userAgent: string): string {
  if (/Windows/.test(userAgent)) return "Windows"
  if (/Mac OS/.test(userAgent)) return "macOS"
  if (/Linux/.test(userAgent)) return "Linux"
  if (/Android/.test(userAgent)) return "Android"
  if (/iOS/.test(userAgent)) return "iOS"
  return "Other"
}

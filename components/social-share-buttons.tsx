"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react"

interface SocialShareButtonsProps {
  url: string
  title?: string
  description?: string
}

export function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title || "")
  const encodedDescription = encodeURIComponent(description || "")

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400")
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Partager :</span>
      <Button size="sm" variant="outline" onClick={() => openShare("facebook")}>
        <Facebook className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => openShare("twitter")}>
        <Twitter className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => openShare("linkedin")}>
        <Linkedin className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => openShare("whatsapp")}>
        <MessageCircle className="h-3 w-3" />
      </Button>
    </div>
  )
}

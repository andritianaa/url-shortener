"use client";

import {
  Archive,
  Clock,
  Download,
  File,
  FileText,
  HardDrive,
  Image,
  Music,
  Video,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DownloadPageProps {
  filename: string;
  fileSize: number;
  contentType: string;
}

export function DownloadPage({
  filename,
  fileSize,
  contentType,
}: DownloadPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) return Image;
    if (contentType.startsWith("video/")) return Video;
    if (contentType.startsWith("audio/")) return Music;
    if (contentType.includes("zip") || contentType.includes("rar"))
      return Archive;
    if (contentType.includes("text") || contentType.includes("pdf"))
      return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileType = (contentType: string) => {
    const types: { [key: string]: string } = {
      "image/jpeg": "Image JPEG",
      "image/png": "Image PNG",
      "image/gif": "Image GIF",
      "video/mp4": "Vidéo MP4",
      "video/avi": "Vidéo AVI",
      "audio/mp3": "Audio MP3",
      "audio/wav": "Audio WAV",
      "application/pdf": "Document PDF",
      "application/zip": "Archive ZIP",
      "text/plain": "Fichier texte",
    };
    return types[contentType] || "Fichier";
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Créer directement le lien de téléchargement
      const originalName =
        filename.split("_").slice(0, -1).join("_") +
        "." +
        filename.split(".").pop();

      const a = document.createElement("a");
      a.href = `https://fs.teratany.org/files/${filename}`;
      a.download = originalName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Enregistrer les statistiques de téléchargement
      await fetch("/api/stats/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const FileIcon = getFileIcon(contentType);
  const originalName =
    filename.split("_").slice(0, -1).join("_") +
    "." +
    filename.split(".").pop();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileIcon className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle>Téléchargement de fichier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nom du fichier</span>
              <Badge variant="outline">{getFileType(contentType)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground break-all bg-muted p-2 rounded">
              {originalName}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span>Taille: {formatFileSize(fileSize)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Prêt</span>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-pulse" />
                Téléchargement en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger le fichier
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Le téléchargement commencera automatiquement dans votre navigateur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

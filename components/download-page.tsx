"use client";

import {
    Archive, Clock, Download, File, FileText, HardDrive, ImageIcon, Music, Video
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) return ImageIcon;
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
    setDownloadStarted(true);

    try {
      // Simuler le téléchargement avec progression
      const response = await fetch(`https://fs.teratany.org/files/${filename}`);

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const reader = response.body?.getReader();
      const contentLength = Number.parseInt(
        response.headers.get("content-length") || "0"
      );

      let receivedLength = 0;
      const chunks = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          const progress = (receivedLength / contentLength) * 100;
          setDownloadProgress(progress);
        }
      }

      // Créer le blob et déclencher le téléchargement
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        filename.split("_").slice(0, -1).join("_") +
        "." +
        filename.split(".").pop();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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

          {downloadStarted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <Progress value={downloadProgress} className="w-full" />
            </div>
          )}

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
              Le téléchargement commencera automatiquement après avoir cliqué
              sur le bouton
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

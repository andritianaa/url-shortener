import { notFound } from 'next/navigation';

import { DownloadPage } from '@/components/download-page';

interface PageProps {
  params: {
    filename: string;
  };
}

export default async function FileDownloadPage({ params }: PageProps) {
  const { filename } = params;

  try {
    // Vérifier si le fichier existe
    const response = await fetch(`https://fs.teratany.org/files/${filename}`, {
      method: "HEAD",
    });

    if (!response.ok) {
      notFound();
    }

    const fileSize = response.headers.get("content-length");
    const contentType = response.headers.get("content-type");

    return (
      <DownloadPage
        filename={filename}
        fileSize={fileSize ? Number.parseInt(fileSize) : 0}
        contentType={contentType || "application/octet-stream"}
      />
    );
  } catch (error) {
    notFound();
  }
}

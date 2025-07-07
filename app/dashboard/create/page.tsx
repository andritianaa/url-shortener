"use client";

import { UrlShortenerForm } from '@/components/url-shortener-form';

export default function CreateLinkPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer un nouveau lien</h1>
          <p className="text-muted-foreground">
            Raccourcissez une URL ou partagez un fichier avec des options
            avancées
          </p>
        </div>

        <UrlShortenerForm />
      </div>
    </div>
  );
}

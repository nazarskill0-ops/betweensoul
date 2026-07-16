"use client";

import { useState } from "react";

function getYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function PlayButtonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="11" fill="white" fillOpacity={0.3} />
      <path d="M10 8.3v7.4l6.5-3.7-6.5-3.7z" fill="white" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function VideoIntroBlock({
  videoUrl,
  avatarUrl,
  fullName,
}: {
  videoUrl: string | null;
  avatarUrl: string | null;
  fullName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  const videoId = getYoutubeVideoId(videoUrl);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-2xl text-ink">Знайомство</h2>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative aspect-video w-full overflow-hidden rounded-card"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-sage-light" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/30">
          <PlayButtonIcon className="h-20 w-20" />
        </div>
      </button>

      {isOpen && videoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-card bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрити"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-card">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Відео ${fullName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>

            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-sage transition-colors hover:text-sage/80"
            >
              Перейти на YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

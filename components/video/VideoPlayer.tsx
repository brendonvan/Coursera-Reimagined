'use client';

import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  onTimeUpdate: (currentTimeSeconds: number) => void;
  seekTo?: number;
}

export default function VideoPlayer({ videoUrl, onTimeUpdate, seekTo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && seekTo !== undefined) {
      videoRef.current.currentTime = seekTo;
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked — user can press play manually
      });
    }
  }, [seekTo]);

  return (
    <div className="bg-black w-full aspect-video flex items-center justify-center shrink-0">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full h-full"
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-sm">No video loaded for this lesson</p>
        </div>
      )}
    </div>
  );
}

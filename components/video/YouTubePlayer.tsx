'use client';

import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTimeSeconds: number) => void;
  seekTo?: number;
}

export default function YouTubePlayer({ videoUrl, onTimeUpdate, seekTo }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readyRef = useRef(false);
  const playerIdRef = useRef(`yt-${Math.random().toString(36).slice(2)}`);

  const videoId = videoUrl.split('/embed/')[1]?.split('?')[0] ?? '';

  useEffect(() => {
    function createPlayer() {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player(playerIdRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            readyRef.current = true;
            intervalRef.current = setInterval(() => {
              if (playerRef.current && readyRef.current) {
                onTimeUpdate(playerRef.current.getCurrentTime());
              }
            }, 1000);
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
    }

    return () => {
      readyRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    if (seekTo !== undefined && playerRef.current && readyRef.current) {
      playerRef.current.seekTo(seekTo, true);
    }
  }, [seekTo]);

  return (
    <div className="w-full h-full">
      <div id={playerIdRef.current} className="w-full h-full" />
    </div>
  );
}

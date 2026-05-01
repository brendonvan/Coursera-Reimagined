'use client';

import { useEffect, useRef } from 'react';
import { TranscriptChunk } from '@/types';
import { timeStringToSeconds } from '@/lib/utils/formatTime';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  currentTime: number;
  onChunkClick: (startTimeSeconds: number) => void;
}

export default function TranscriptPanel({ chunks, currentTime, onChunkClick }: TranscriptPanelProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  const activeChunk = chunks.find((chunk) => {
    const start = timeStringToSeconds(chunk.startTime);
    const end = timeStringToSeconds(chunk.endTime);
    return currentTime >= start && currentTime < end;
  });

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeChunk?.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#091A2F] border-t border-[#1F2937]">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
          Transcript
        </h2>

        {chunks.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No transcript available for this lesson.</p>
        ) : (
          <div className="space-y-1.5">
            {chunks.map((chunk) => {
              const isActive = chunk.id === activeChunk?.id;
              return (
                <button
                  key={chunk.id}
                  ref={isActive ? activeRef : null}
                  onClick={() => onChunkClick(timeStringToSeconds(chunk.startTime))}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-[#182432] text-[#E5E7EB] font-medium border-l-2 border-[#2563EB]'
                      : 'text-[#9CA3AF] hover:bg-[#182432] hover:text-[#E5E7EB]'
                  }`}
                >
                  <span className="font-mono text-xs text-[#2563EB] mr-2">
                    {chunk.startTime}
                  </span>
                  {chunk.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

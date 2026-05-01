'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import VideoPlayer from '@/components/video/VideoPlayer';
import TranscriptPanel from '@/components/transcript/TranscriptPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { mockCourse, mockTranscriptChunks } from '@/lib/mock/data';
import { Lesson } from '@/types';

export default function HomePage() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(mockCourse.lessons[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentTime(0);
    setSeekTo(0);
  }, []);

  const handleChunkClick = useCallback((startTimeSeconds: number) => {
    setSeekTo(startTimeSeconds);
  }, []);

  const lessonChunks = mockTranscriptChunks.filter(
    (chunk) => chunk.lessonId === activeLesson.id,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#07182D] text-[#E5E7EB]">
      <Sidebar
        course={mockCourse}
        activeLessonId={activeLesson.id}
        onSelectLesson={handleSelectLesson}
      />
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <VideoPlayer
          videoUrl={activeLesson.videoUrl}
          onTimeUpdate={setCurrentTime}
          seekTo={seekTo}
        />
        <TranscriptPanel
          chunks={lessonChunks}
          currentTime={currentTime}
          onChunkClick={handleChunkClick}
        />
      </main>
      <ChatPanel lessonId={activeLesson.id} />
    </div>
  );
}

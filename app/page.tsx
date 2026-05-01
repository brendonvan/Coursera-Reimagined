'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import VideoPlayer from '@/components/video/VideoPlayer';
import TranscriptPanel from '@/components/transcript/TranscriptPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { mockCourse, mockTranscriptChunks } from '@/lib/mock/data';
import { Lesson } from '@/types';

type MobileTab = 'transcript' | 'lessons' | 'chat';

export default function HomePage() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(mockCourse.lessons[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<MobileTab>('transcript');

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
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#07182D] text-[#E5E7EB] lg:flex-row">

      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          course={mockCourse}
          activeLessonId={activeLesson.id}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Main column */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <VideoPlayer
          videoUrl={activeLesson.videoUrl}
          onTimeUpdate={setCurrentTime}
          seekTo={seekTo}
        />

        {/* Mobile tab bar */}
        <nav className="flex shrink-0 border-b border-[#1F2937] lg:hidden">
          {(['transcript', 'lessons', 'chat'] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 capitalize py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Mobile panel */}
        <div className="flex flex-1 overflow-hidden lg:hidden">
          {activeTab === 'transcript' && (
            <TranscriptPanel
              chunks={lessonChunks}
              currentTime={currentTime}
              onChunkClick={handleChunkClick}
            />
          )}
          {activeTab === 'lessons' && (
            <Sidebar
              course={mockCourse}
              activeLessonId={activeLesson.id}
              onSelectLesson={(lesson) => {
                handleSelectLesson(lesson);
                setActiveTab('transcript');
              }}
              mobile
            />
          )}
          {activeTab === 'chat' && (
            <ChatPanel lessonId={activeLesson.id} mobile />
          )}
        </div>

        {/* Desktop transcript */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <TranscriptPanel
            chunks={lessonChunks}
            currentTime={currentTime}
            onChunkClick={handleChunkClick}
          />
        </div>
      </main>

      {/* Chat panel — desktop only */}
      <div className="hidden lg:flex">
        <ChatPanel lessonId={activeLesson.id} />
      </div>
    </div>
  );
}

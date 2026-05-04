'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import VideoPlayer from '@/components/video/VideoPlayer';
import TranscriptPanel from '@/components/transcript/TranscriptPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { Course, Lesson, TranscriptChunk } from '@/types';

type MobileTab = 'transcript' | 'lessons' | 'chat';

export default function HomePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonChunks, setLessonChunks] = useState<TranscriptChunk[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<MobileTab>('transcript');
  const [isLoading, setIsLoading] = useState(true);

  // Load most recent course on mount
  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((data) => {
        const first: Course | undefined = data.courses?.[0];
        if (first) {
          setCourse(first);
          setActiveLesson(first.lessons[0] ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch chunks when active lesson changes
  useEffect(() => {
    if (!activeLesson) { setLessonChunks([]); return; }
    fetch(`/api/chunks?lessonId=${activeLesson.id}`)
      .then((r) => r.json())
      .then((data) => setLessonChunks(data.chunks ?? []));
  }, [activeLesson?.id]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentTime(0);
    setSeekTo(0);
  }, []);

  const handleChunkClick = useCallback((startTimeSeconds: number) => {
    setSeekTo(startTimeSeconds);
  }, []);

  const handleCourseIngested = useCallback((newCourse: Course) => {
    setCourse(newCourse);
    setActiveLesson(newCourse.lessons[0] ?? null);
    setLessonChunks([]);
    setCurrentTime(0);
    setSeekTo(undefined);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#07182D] text-[#9CA3AF] text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#07182D] text-[#E5E7EB] lg:flex-row">

      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          course={course}
          activeLessonId={activeLesson?.id ?? ''}
          onSelectLesson={handleSelectLesson}
          onCourseIngested={handleCourseIngested}
        />
      </div>

      {/* Main column */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <VideoPlayer
          videoUrl={activeLesson?.videoUrl}
          onTimeUpdate={setCurrentTime}
          seekTo={seekTo}
        />

        {/* Mobile tab bar */}
        <nav className="flex shrink-0 border-b border-[#1F2937] lg:hidden">
          {(['lessons', 'transcript', 'chat'] as MobileTab[]).map((tab) => (
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
              course={course}
              activeLessonId={activeLesson?.id ?? ''}
              onSelectLesson={(lesson) => {
                handleSelectLesson(lesson);
                setActiveTab('transcript');
              }}
              onCourseIngested={(newCourse) => {
                handleCourseIngested(newCourse);
                setActiveTab('transcript');
              }}
              mobile
            />
          )}
          {activeTab === 'chat' && (
            <ChatPanel lessonId={activeLesson?.id ?? ''} mobile />
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
        <ChatPanel lessonId={activeLesson?.id ?? ''} />
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { Course, Lesson } from '@/types';

interface IngestProgress {
  current: number;
  total: number;
  currentTitle: string;
  status: string;
}

interface SidebarProps {
  course: Course | null;
  activeLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  onCourseIngested: (course: Course) => void;
  mobile?: boolean;
}

export default function Sidebar({
  course,
  activeLessonId,
  onSelectLesson,
  onCourseIngested,
  mobile,
}: SidebarProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [progress, setProgress] = useState<IngestProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const totalRef = useRef(0);

  async function handleIngest(e: FormEvent) {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url || isIngesting) return;

    setIsIngesting(true);
    setError(null);
    setProgress({ current: 0, total: 0, currentTitle: '', status: 'Starting…' });

    try {
      const res = await fetch('/api/ingest/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok || !res.body) throw new Error('Ingestion request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'start') {
              totalRef.current = event.total;
              setProgress({ current: 0, total: event.total, currentTitle: '', status: 'Starting…' });
            } else if (event.type === 'progress') {
              const statusLabel =
                event.status === 'fetching_transcript' ? 'Fetching captions…' :
                event.status === 'embedding' ? 'Generating embeddings…' : 'Done';
              setProgress({
                current: event.videoIndex + 1,
                total: totalRef.current,
                currentTitle: event.title,
                status: statusLabel,
              });
            } else if (event.type === 'complete') {
              onCourseIngested(event.course);
              setUrlInput('');
            } else if (event.type === 'error') {
              // Per-video error — non-fatal, continue
            } else if (event.type === 'fatal') {
              setError(event.message);
            }
          } catch {
            // Malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsIngesting(false);
      setProgress(null);
    }
  }

  return (
    <aside className={mobile
      ? 'w-full flex flex-col overflow-hidden bg-[#091A2F]'
      : 'w-72 shrink-0 border-r border-[#1F2937] flex flex-col overflow-hidden bg-[#091A2F]'
    }>
      {/* Logo */}
      <div className="relative flex flex-col items-center border-b border-[#1F2937] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 140% 180% at 0% 0%, rgba(37,99,235,0.35) 0%, transparent 75%)',
          }}
        />
        <Image
          src="/coursera_logo.png"
          alt="Coursera Reimagined"
          width={250}
          height={63}
          className="relative object-contain w-auto h-auto"
          priority
        />
      </div>

      {/* Playlist URL input */}
      <form onSubmit={handleIngest} className="p-3 border-b border-[#1F2937] shrink-0">
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste YouTube playlist URL…"
            disabled={isIngesting}
            className="flex-1 text-xs px-2 py-1.5 rounded-md bg-[#182432] border border-[#1F2937] text-[#E5E7EB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isIngesting || !urlInput.trim()}
            className="bg-[#2563EB] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isIngesting ? '…' : 'Add'}
          </button>
        </div>

        {isIngesting && progress && (
          <div className="mt-2">
            <div className="h-1 bg-[#182432] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1 truncate">
              {progress.currentTitle
                ? `${progress.current}/${progress.total}: ${progress.currentTitle} — ${progress.status}`
                : progress.status}
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 mt-1.5 truncate" title={error}>{error}</p>
        )}
      </form>

      {/* Lesson list */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Course lessons">
        {course ? (
          <>
            <h2 className="relative mt-2 text-md font-semibold text-[#E5E7EB] leading-tight text-center mb-4">
              {course.title}
            </h2>
            <p className="px-3 py-1 text-sm text-[#E5E7EB] uppercase tracking-wide font-medium">
              Lessons
            </p>
            <ul className="mt-1 space-y-0.5">
              {course.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                      activeLessonId === lesson.id
                        ? 'bg-[#2563EB] text-[#E5E7EB] font-medium'
                        : 'text-[#E5E7EB] hover:bg-[#182432]'
                    }`}
                  >
                    <span className="block truncate">{lesson.title}</span>
                    <span className="text-xs text-[#9CA3AF] opacity-70">{lesson.duration}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#9CA3AF] px-4 text-center">
            <p className="text-sm">Paste a YouTube playlist URL above to get started.</p>
          </div>
        )}
      </nav>
    </aside>
  );
}

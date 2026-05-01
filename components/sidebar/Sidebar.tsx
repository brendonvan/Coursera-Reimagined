'use client';

import Image from 'next/image';
import { Course, Lesson } from '@/types';

interface SidebarProps {
  course: Course;
  activeLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function Sidebar({ course, activeLessonId, onSelectLesson }: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-[#1F2937] flex flex-col overflow-hidden bg-[#091A2F]">
      {/* Logo + course title */}
      <div className="relative flex flex-col items-center border-b border-[#1F2937] overflow-hidden">
        {/* Glow: originates top-left, fades to transparent bottom-right */}
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
          className="relative object-contain"
          priority
        />
      </div>

      {/* Lesson list */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Course lessons">
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
                    : 'text-[#E5E7EB] hover:bg-[#182432] hover:text-[#E5E7EB]'
                }`}
              >
                <span className="block truncate">{lesson.title}</span>
                <span className="text-xs text-[#9CA3AF] opacity-70">{lesson.duration}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

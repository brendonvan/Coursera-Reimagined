export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g. "12:34"
  videoUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

// Core RAG data unit — each chunk maps to a time window in a lesson
export interface TranscriptChunk {
  id: string;
  courseId: string;
  lessonId: string;
  source: 'video' | 'slides' | 'notes';
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
  text: string;
}

export interface Citation {
  lessonId: string;
  startTime: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

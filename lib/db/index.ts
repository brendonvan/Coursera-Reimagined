import { createClient } from '@supabase/supabase-js';
import { Course, Lesson, TranscriptChunk } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Chunks ──────────────────────────────────────────────────────────────────

export async function storeChunk(
  chunk: Omit<TranscriptChunk, 'id'> & { embedding: number[] },
): Promise<void> {
  const { error } = await supabase.from('chunks').insert({
    course_id: chunk.courseId,
    lesson_id: chunk.lessonId,
    source: chunk.source,
    start_time: chunk.startTime,
    end_time: chunk.endTime,
    text: chunk.text,
    embedding: chunk.embedding,
  });
  if (error) throw error;
}

export async function queryChunksByEmbedding(
  lessonId: string,
  embedding: number[],
  topK = 5,
): Promise<TranscriptChunk[]> {
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_lesson_id: lessonId,
    match_count: topK,
  });
  if (error) throw error;

  return (data ?? []).map((row: {
    id: string; lesson_id: string; start_time: string; end_time: string; text: string;
  }) => ({
    id: row.id,
    courseId: '',
    lessonId: row.lesson_id,
    source: 'video' as const,
    startTime: row.start_time,
    endTime: row.end_time,
    text: row.text,
  }));
}

export async function getChunksByLessonId(lessonId: string): Promise<TranscriptChunk[]> {
  const { data, error } = await supabase
    .from('chunks')
    .select('id, course_id, lesson_id, source, start_time, end_time, text')
    .eq('lesson_id', lessonId)
    .order('start_time');
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    lessonId: row.lesson_id,
    source: row.source as TranscriptChunk['source'],
    startTime: row.start_time,
    endTime: row.end_time,
    text: row.text,
  }));
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function storeCourse(input: {
  title: string;
  playlistId: string;
}): Promise<{ id: string; title: string; playlistId: string }> {
  const { data, error } = await supabase
    .from('courses')
    .insert({ title: input.title, playlist_id: input.playlistId })
    .select('id, title, playlist_id')
    .single();
  if (error) throw error;
  return { id: data.id, title: data.title, playlistId: data.playlist_id };
}

export async function getCourseByPlaylistId(playlistId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`id, title, lessons ( id, video_id, title, duration, position )`)
    .eq('playlist_id', playlistId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    lessons: ((data.lessons as {
      id: string; video_id: string; title: string; duration: string; position: number;
    }[]) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((l): Lesson => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoUrl: `https://www.youtube.com/embed/${l.video_id}`,
      })),
  };
}

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`id, title, lessons ( id, video_id, title, duration, position )`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((course) => ({
    id: course.id,
    title: course.title,
    lessons: ((course.lessons as {
      id: string; video_id: string; title: string; duration: string; position: number;
    }[]) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((l): Lesson => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoUrl: `https://www.youtube.com/embed/${l.video_id}`,
      })),
  }));
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export async function storeLesson(input: {
  courseId: string;
  videoId: string;
  title: string;
  duration: string;
  position: number;
}): Promise<{ id: string; videoId: string; title: string; duration: string; position: number }> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: input.courseId,
      video_id: input.videoId,
      title: input.title,
      duration: input.duration,
      position: input.position,
    })
    .select('id, video_id, title, duration, position')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    videoId: data.video_id,
    title: data.title,
    duration: data.duration,
    position: data.position,
  };
}

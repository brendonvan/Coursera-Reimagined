import { createClient } from '@supabase/supabase-js';
import { TranscriptChunk } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function storeChunk(
  chunk: TranscriptChunk & { embedding: number[] },
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
  topK: number = 5,
): Promise<TranscriptChunk[]> {
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_lesson_id: lessonId,
    match_count: topK,
  });
  if (error) throw error;

  return (data ?? []).map((row: {
    id: string;
    lesson_id: string;
    start_time: string;
    end_time: string;
    text: string;
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

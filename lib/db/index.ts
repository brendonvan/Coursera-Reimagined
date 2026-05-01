// Placeholder for Supabase database operations
// Replace with actual Supabase client calls when ready

import { TranscriptChunk } from '@/types';

export async function storeChunk(_chunk: TranscriptChunk): Promise<void> {
  throw new Error('Not implemented — connect Supabase');
}

export async function queryChunksByEmbedding(
  _lessonId: string,
  _embedding: number[],
  _topK: number,
): Promise<TranscriptChunk[]> {
  throw new Error('Not implemented — connect Supabase pgvector');
}

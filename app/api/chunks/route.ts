import { NextRequest, NextResponse } from 'next/server';
import { mockTranscriptChunks } from '@/lib/mock/data';

// GET /api/chunks?lessonId=lesson-1&query=supervised
// Returns top-N chunks relevant to the query (mock keyword search for now)
// TODO: replace keyword filter with pgvector cosine similarity
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  const query = searchParams.get('query')?.toLowerCase() ?? '';

  let chunks = mockTranscriptChunks;

  if (lessonId) {
    chunks = chunks.filter((c) => c.lessonId === lessonId);
  }

  if (query) {
    chunks = chunks.filter((c) => c.text.toLowerCase().includes(query));
  }

  return NextResponse.json({ chunks: chunks.slice(0, 5) });
}

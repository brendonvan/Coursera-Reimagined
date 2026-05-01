import { NextRequest, NextResponse } from 'next/server';
import { TranscriptChunk } from '@/types';

// In-memory store — replace with Supabase when ready
const store: TranscriptChunk[] = [];

// POST /api/transcript — upload a new transcript chunk
export async function POST(req: NextRequest) {
  const body = await req.json();
  const chunk = body as TranscriptChunk;

  // TODO: validate schema, store in Supabase + generate embedding
  store.push(chunk);

  return NextResponse.json({ success: true, chunk }, { status: 201 });
}

// GET /api/transcript?lessonId=lesson-1 — fetch stored chunks
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');

  const result = lessonId
    ? store.filter((c) => c.lessonId === lessonId)
    : store;

  return NextResponse.json({ chunks: result });
}

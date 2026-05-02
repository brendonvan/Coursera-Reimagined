import { NextRequest, NextResponse } from 'next/server';
import { getChunksByLessonId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const lessonId = new URL(req.url).searchParams.get('lessonId');

  if (!lessonId) {
    return NextResponse.json({ chunks: [] });
  }

  const chunks = await getChunksByLessonId(lessonId);
  return NextResponse.json({ chunks });
}

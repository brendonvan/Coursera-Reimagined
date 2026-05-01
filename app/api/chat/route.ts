import { NextRequest, NextResponse } from 'next/server';
import { mockTranscriptChunks } from '@/lib/mock/data';

// POST /api/chat — receive a user question, return a grounded answer
// Currently: mock keyword retrieval + static reply
// TODO: embed query → pgvector search → LLM chat completion
export async function POST(req: NextRequest) {
  const { message, lessonId } = await req.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  // Mock retrieval: find chunks whose text overlaps with any word in the query
  const queryWords = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const relevant = mockTranscriptChunks
    .filter((c) => !lessonId || c.lessonId === lessonId)
    .filter((c) => queryWords.some((word) => c.text.toLowerCase().includes(word)))
    .slice(0, 3);

  const reply =
    relevant.length > 0
      ? `Based on the course content: "${relevant[0].text.slice(0, 120)}..."`
      : "I couldn't find specific information about that in the current lesson. Try rephrasing your question.";

  return NextResponse.json({
    reply,
    citations: relevant.map((c) => ({
      lessonId: c.lessonId,
      startTime: c.startTime,
      text: c.text,
    })),
  });
}

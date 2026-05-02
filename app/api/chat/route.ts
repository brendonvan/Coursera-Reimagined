import { NextRequest, NextResponse } from 'next/server';
import { retrieveChunks, generateAnswer } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const { message, lessonId } = await req.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  try {
    const chunks = await retrieveChunks(message, lessonId);
    const reply = await generateAnswer(message, chunks);

    return NextResponse.json({
      reply,
      citations: chunks.map((c) => ({
        lessonId: c.lessonId,
        startTime: c.startTime,
        text: c.text,
      })),
    });
  } catch (err) {
    console.error('[chat] RAG pipeline error:', err);
    return NextResponse.json(
      { error: 'Failed to generate a response. Please try again.' },
      { status: 500 },
    );
  }
}

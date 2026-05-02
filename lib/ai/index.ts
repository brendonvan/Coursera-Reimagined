import OpenAI from 'openai';
import { queryChunksByEmbedding } from '@/lib/db';
import { TranscriptChunk } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export async function retrieveChunks(
  query: string,
  lessonId: string,
): Promise<TranscriptChunk[]> {
  const embedding = await embedText(query);
  return queryChunksByEmbedding(lessonId, embedding, 5);
}

export async function generateAnswer(
  query: string,
  chunks: TranscriptChunk[],
): Promise<string> {
  const context = chunks
    .map((c) => `[${c.startTime}] ${c.text}`)
    .join('\n\n');

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI course tutor. Answer the student's question using only the course content provided below.
- If the answer is in the content, answer clearly and cite the timestamp (e.g. "At 04:12...").
- If the answer is not in the content, say so clearly, then optionally give a brief general explanation.
- Keep answers concise and beginner-friendly.

Course content:
${context || 'No course content available for this lesson yet.'}`,
      },
      { role: 'user', content: query },
    ],
  });

  return res.choices[0].message.content ?? 'No response generated.';
}

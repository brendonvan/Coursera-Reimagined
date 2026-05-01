// Placeholder for RAG pipeline: embeddings → retrieval → generation
// Wire these up to OpenAI + Supabase pgvector when ready

export async function embedText(_text: string): Promise<number[]> {
  throw new Error('Not implemented — connect OpenAI Embeddings API');
}

export async function retrieveChunks(
  _query: string,
  _lessonId: string,
): Promise<string[]> {
  throw new Error('Not implemented — connect Supabase pgvector similarity search');
}

export async function generateAnswer(
  _query: string,
  _contextChunks: string[],
): Promise<string> {
  throw new Error('Not implemented — connect OpenAI Chat Completions API');
}

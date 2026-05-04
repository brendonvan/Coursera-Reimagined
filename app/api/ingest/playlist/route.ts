import { NextRequest } from 'next/server';
import {
  getPlaylistVideos,
  getPlaylistTitle,
  getVideoTranscript,
  chunkTranscript,
  extractPlaylistId,
  secondsToTimeString,
} from '@/lib/youtube';
import { storeCourse, storeLesson, storeChunk, getCourseByPlaylistId } from '@/lib/db';
import { embedText } from '@/lib/ai';
import { Course, Lesson } from '@/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return JSON.stringify(err);
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        if (!url || typeof url !== 'string') {
          send({ type: 'fatal', message: 'A valid playlist URL is required.' });
          controller.close();
          return;
        }

        // Fetch playlist metadata
        const playlistId = extractPlaylistId(url);

        // Return existing course immediately if already ingested
        const existing = await getCourseByPlaylistId(playlistId);
        if (existing) {
          send({ type: 'complete', courseId: existing.id, course: existing });
          controller.close();
          return;
        }

        const [videos, title] = await Promise.all([
          getPlaylistVideos(url),
          getPlaylistTitle(playlistId),
        ]);

        if (videos.length === 0) {
          send({ type: 'fatal', message: 'No public videos found in this playlist.' });
          controller.close();
          return;
        }

        send({ type: 'start', total: videos.length });

        // Create course record
        const course = await storeCourse({ title, playlistId });
        const lessons: Lesson[] = [];

        // Process each video
        for (const video of videos) {
          send({
            type: 'progress',
            videoIndex: video.position,
            videoId: video.videoId,
            title: video.title,
            status: 'fetching_transcript',
          });

          try {
            // Store lesson
            const lesson = await storeLesson({
              courseId: course.id,
              videoId: video.videoId,
              title: video.title,
              duration: secondsToTimeString(video.durationSeconds),
              position: video.position,
            });

            lessons.push({
              id: lesson.id,
              title: lesson.title,
              duration: lesson.duration,
              videoUrl: `https://www.youtube.com/embed/${video.videoId}`,
            });

            // Fetch captions
            const captions = await getVideoTranscript(video.videoId);
            const rawChunks = chunkTranscript(captions, course.id, lesson.id);

            send({
              type: 'progress',
              videoIndex: video.position,
              videoId: video.videoId,
              title: video.title,
              status: 'embedding',
            });

            // Embed and store chunks in batches of 10
            let chunksStored = 0;
            for (let i = 0; i < rawChunks.length; i += 10) {
              const batch = rawChunks.slice(i, i + 10);
              await Promise.all(
                batch.map(async (chunk) => {
                  const embedding = await embedText(chunk.text);
                  await storeChunk({ ...chunk, embedding });
                  chunksStored++;
                }),
              );
            }

            send({
              type: 'progress',
              videoIndex: video.position,
              videoId: video.videoId,
              title: video.title,
              status: 'done',
              chunksStored,
            });
          } catch (videoErr) {
            send({
              type: 'error',
              videoIndex: video.position,
              videoId: video.videoId,
              title: video.title,
              message: errMsg(videoErr),
            });
          }

          await delay(300);
        }

        const fullCourse: Course = { id: course.id, title: course.title, lessons };
        send({ type: 'complete', courseId: course.id, course: fullCourse });
      } catch (err) {
        send({ type: 'fatal', message: errMsg(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

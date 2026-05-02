import { YoutubeTranscript } from 'youtube-transcript';
import { TranscriptChunk } from '@/types';

export interface PlaylistVideo {
  videoId: string;
  title: string;
  durationSeconds: number;
  position: number;
}

interface RawCaption {
  text: string;
  start: number;
  dur: number;
}

const YT_API = 'https://www.googleapis.com/youtube/v3';

export function extractPlaylistId(url: string): string {
  const id = new URL(url).searchParams.get('list');
  if (!id) throw new Error('Invalid YouTube playlist URL — no "list" parameter found');
  return id;
}

function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] ?? '0') * 3600 +
    parseInt(match[2] ?? '0') * 60 +
    parseInt(match[3] ?? '0')
  );
}

export function secondsToTimeString(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getPlaylistTitle(playlistId: string): Promise<string> {
  const apiKey = process.env.YOUTUBE_API_KEY!;
  const params = new URLSearchParams({ part: 'snippet', id: playlistId, key: apiKey });
  const res = await fetch(`${YT_API}/playlists?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error fetching playlist: ${res.status} — ${body}`);
  }
  const data = await res.json();
  return data.items?.[0]?.snippet?.title ?? 'Untitled Playlist';
}

export async function getPlaylistVideos(url: string): Promise<PlaylistVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const playlistId = extractPlaylistId(url);
  const videos: { videoId: string; title: string; position: number }[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(`${YT_API}/playlistItems?${params}`);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${await res.text()}`);
    const data = await res.json();

    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      const position = item.snippet?.position ?? videos.length;
      if (videoId && title && title !== 'Deleted video' && title !== 'Private video') {
        videos.push({ videoId, title, position });
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Batch-fetch durations (max 50 per request)
  const result: PlaylistVideo[] = [];
  for (let i = 0; i < videos.length; i += 50) {
    const batch = videos.slice(i, i + 50);
    const ids = batch.map((v) => v.videoId).join(',');
    const params = new URLSearchParams({ part: 'contentDetails', id: ids, key: apiKey });
    const res = await fetch(`${YT_API}/videos?${params}`);
    if (!res.ok) throw new Error(`YouTube API error fetching durations: ${res.status}`);
    const data = await res.json();

    const durationMap = new Map<string, number>();
    for (const item of data.items ?? []) {
      durationMap.set(item.id, parseISODuration(item.contentDetails?.duration ?? ''));
    }
    for (const v of batch) {
      result.push({ ...v, durationSeconds: durationMap.get(v.videoId) ?? 0 });
    }
  }

  return result.sort((a, b) => a.position - b.position);
}

export async function getVideoTranscript(videoId: string): Promise<RawCaption[]> {
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  return items.map((item) => ({
    text: item.text,
    start: item.offset / 1000,
    dur: item.duration / 1000,
  }));
}

export function chunkTranscript(
  captions: RawCaption[],
  courseId: string,
  lessonId: string,
  targetSeconds = 60,
): Omit<TranscriptChunk, 'id'>[] {
  if (captions.length === 0) return [];

  const chunks: Omit<TranscriptChunk, 'id'>[] = [];
  let current: RawCaption[] = [];
  let currentStart = captions[0].start;
  let elapsed = 0;

  function flush() {
    if (current.length === 0) return;
    const last = current[current.length - 1];
    chunks.push({
      courseId,
      lessonId,
      source: 'video',
      startTime: secondsToTimeString(currentStart),
      endTime: secondsToTimeString(last.start + last.dur),
      text: current.map((c) => decodeHTMLEntities(c.text)).join(' '),
    });
  }

  for (const caption of captions) {
    current.push(caption);
    elapsed += caption.dur;
    if (elapsed >= targetSeconds) {
      flush();
      current = [];
      currentStart = caption.start + caption.dur;
      elapsed = 0;
    }
  }
  flush();

  return chunks;
}

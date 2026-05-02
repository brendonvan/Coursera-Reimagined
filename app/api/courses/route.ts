import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/db';

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json({ courses });
  } catch (err) {
    console.error('[GET /api/courses]', err);
    return NextResponse.json({ courses: [], error: String(err) }, { status: 500 });
  }
}

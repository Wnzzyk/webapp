// src/app/api/telegram-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTelegramFileUrl } from '@/lib/telegram';

// Cache for 1 hour
const cache = new Map<string, { url: string; ts: number }>();

export async function GET(req: NextRequest) {
  const fileId = new URL(req.url).searchParams.get('file_id');
  if (!fileId) return NextResponse.json({ error: 'No file_id' }, { status: 400 });

  // Check memory cache
  const cached = cache.get(fileId);
  if (cached && Date.now() - cached.ts < 3_600_000) {
    return NextResponse.redirect(cached.url);
  }

  const url = await getTelegramFileUrl(fileId);
  if (!url) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  cache.set(fileId, { url, ts: Date.now() });
  return NextResponse.redirect(url);
}

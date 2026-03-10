// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPlayers } from '@/lib/db';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || '';
  const results = await searchPlayers(q);
  return NextResponse.json(results);
}

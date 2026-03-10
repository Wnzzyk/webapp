// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db';

export const revalidate = 60; // cache 60 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league') === 'pro' ? 'pro' : 'default';
  const data = await getLeaderboard(league, 100);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}

// src/app/api/player/[nickname]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerProfile } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { nickname: string } }
) {
  const nickname = decodeURIComponent(params.nickname);
  const player = await getPlayerProfile({ nickname });
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(player);
}

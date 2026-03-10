// src/app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram';
import { getPlayerProfile } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  if (!initData) return NextResponse.json({ error: 'No initData' }, { status: 400 });

  const tgUser = validateTelegramInitData(initData);
  if (!tgUser) return NextResponse.json({ error: 'Invalid initData' }, { status: 401 });

  const player = await getPlayerProfile({ telegramId: BigInt(tgUser.id) });
  if (!player) return NextResponse.json({ error: 'Not registered' }, { status: 404 });

  return NextResponse.json({ player, tgUser });
}

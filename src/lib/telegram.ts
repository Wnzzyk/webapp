// src/lib/telegram.ts
import crypto from 'crypto';
import type { TelegramUser } from './types';

const BOT_TOKEN = process.env.BOT_TOKEN!;

/**
 * Validates Telegram Mini App initData and returns the parsed user.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    // Sort keys and build the data-check-string
    const dataCheckArr: string[] = [];
    const sortedKeys = [...params.keys()].sort();
    for (const key of sortedKeys) {
      dataCheckArr.push(`${key}=${params.get(key)}`);
    }
    const dataCheckString = dataCheckArr.join('\n');

    // HMAC-SHA256 with secret key derived from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) return null;

    // Check expiry (24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    const userStr = params.get('user');
    if (!userStr) return null;

    return JSON.parse(userStr) as TelegramUser;
  } catch {
    return null;
  }
}

/**
 * Get Telegram file URL for proxying banner images.
 */
export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const data = await res.json();
    if (!data.ok) return null;
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
  } catch {
    return null;
  }
}

import crypto from 'node:crypto';

export function makeItemId(feedUrl: string, itemUrl: string): string {
  const payload = `${feedUrl.length}|${feedUrl}|${itemUrl.length}|${itemUrl}`;
  return crypto.createHash('sha256').update(payload).digest('base64url');
}

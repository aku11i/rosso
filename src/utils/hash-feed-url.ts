import crypto from 'node:crypto';

export function hashFeedUrl(feedUrl: string) {
  return crypto.createHash('sha256').update(feedUrl).digest('hex');
}

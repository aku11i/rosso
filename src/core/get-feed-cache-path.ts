import path from 'node:path';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';

export function getFeedCachePath(cacheDir: string, feedUrl: string) {
  const hashed = hashFeedUrl(feedUrl);
  return path.join(cacheDir, `${hashed}.json`);
}

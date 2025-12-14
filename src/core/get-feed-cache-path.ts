import path from 'node:path';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';

export function getFeedCachePath(cacheRoot: string, feedUrl: string) {
  const hashed = hashFeedUrl(feedUrl);
  return path.join(cacheRoot, 'feeds', `${hashed}.json`);
}

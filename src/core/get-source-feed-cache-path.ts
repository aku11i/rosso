import path from 'node:path';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';

export function getSourceFeedCachePath(cacheRoot: string, sourceHash: string, feedUrl: string) {
  const feedHash = hashFeedUrl(feedUrl);
  return path.join(cacheRoot, 'sources', sourceHash, 'feeds', `${feedHash}.json`);
}

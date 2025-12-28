import path from 'node:path';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';
import { hashSourceId } from '../utils/hash-source-id.ts';

export function getSourceFeedCachePath(cacheRoot: string, sourceId: string, feedUrl: string) {
  const sourceHash = hashSourceId(sourceId);
  const feedHash = hashFeedUrl(feedUrl);
  return path.join(cacheRoot, 'sources', sourceHash, 'feeds', `${feedHash}.json`);
}

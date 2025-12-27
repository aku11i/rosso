import type { CacheStore } from './cache-store.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { readRawFeedCache } from './read-raw-feed-cache.ts';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import { writeRawFeedCache } from './write-raw-feed-cache.ts';
import { writeSourceFeedCache } from './write-source-feed-cache.ts';

export function createFileSystemCacheStore(cacheRoot: string): CacheStore {
  return {
    readRawFeed: (feedUrl) => readRawFeedCache(getFeedCachePath(cacheRoot, feedUrl)),
    writeRawFeed: (feedUrl, feed) => writeRawFeedCache(getFeedCachePath(cacheRoot, feedUrl), feed),
    readSourceFeed: (sourceId, feedUrl) =>
      readSourceFeedCache(getSourceFeedCachePath(cacheRoot, sourceId, feedUrl)),
    writeSourceFeed: (sourceId, feedUrl, feed) =>
      writeSourceFeedCache(getSourceFeedCachePath(cacheRoot, sourceId, feedUrl), feed),
  };
}

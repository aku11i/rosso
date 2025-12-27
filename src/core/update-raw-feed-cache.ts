import type { SourceCachedFeed } from '../schema.ts';
import type { CacheStore } from './cache-store.ts';
import { fetchFeed } from './fetch-feed.ts';
import { mergeFeedCache } from './merge-feed-cache.ts';

export type UpdateRawFeedCacheOptions = {
  cacheStore: CacheStore;
  feedUrl: string;
  fetchedAt: string;
};

export async function updateRawFeedCache(
  options: UpdateRawFeedCacheOptions,
): Promise<SourceCachedFeed> {
  const previousFeed = await options.cacheStore.readRawFeed(options.feedUrl);
  const fetchedFeed = await fetchFeed(options.feedUrl, options.fetchedAt);
  const mergedFeed = mergeFeedCache(previousFeed, fetchedFeed);

  await options.cacheStore.writeRawFeed(options.feedUrl, mergedFeed);

  return mergedFeed;
}

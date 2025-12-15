import type { SourceCachedFeed } from '../schema.ts';
import { fetchFeed } from './fetch-feed.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { mergeFeedCache } from './merge-feed-cache.ts';
import { readRawFeedCache } from './read-raw-feed-cache.ts';
import { writeRawFeedCache } from './write-raw-feed-cache.ts';

export type UpdateRawFeedCacheOptions = {
  cacheRoot: string;
  feedUrl: string;
  fetchedAt: string;
};

export async function updateRawFeedCache(
  options: UpdateRawFeedCacheOptions,
): Promise<SourceCachedFeed> {
  const cachePath = getFeedCachePath(options.cacheRoot, options.feedUrl);
  const previousFeed = await readRawFeedCache(cachePath);
  const fetchedFeed = await fetchFeed(options.feedUrl, options.fetchedAt);
  const mergedFeed = mergeFeedCache(previousFeed, fetchedFeed);

  await writeRawFeedCache(cachePath, mergedFeed);

  return mergedFeed;
}

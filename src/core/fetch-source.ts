import type { CachedFeed } from '../schema.ts';
import { fetchFeed } from './fetch-feed.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { mergeFeedCache } from './merge-feed-cache.ts';
import { readFeedCache } from './read-feed-cache.ts';
import { processFeedForSource } from './process-feed-for-source.ts';
import { writeFeedCache } from './write-feed-cache.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';

export type FetchSourceOptions = {
  cacheRoot: string;
  sourcePath: string;
};

export type FetchSourceResult = {
  feeds: CachedFeed[];
  fetchedAt: string;
};

export async function fetchSource(options: FetchSourceOptions): Promise<FetchSourceResult> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const fetchTimestamp = new Date().toISOString();
  const sourceHash = await hashSourcePath(options.sourcePath);

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const feeds: CachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const cachePath = getFeedCachePath(options.cacheRoot, feedUrl);

    const previousFeed = await readFeedCache(cachePath);
    const fetchedFeed = await fetchFeed(feedUrl, fetchTimestamp);

    const mergedFeed = mergeFeedCache(previousFeed, fetchedFeed);

    await writeFeedCache(cachePath, mergedFeed);

    const processedCachePath = getSourceFeedCachePath(options.cacheRoot, sourceHash, feedUrl);
    const processedFeed = processFeedForSource({
      sourcePath: options.sourcePath,
      feedUrl,
      feed: mergedFeed,
    });
    await writeFeedCache(processedCachePath, processedFeed);
    feeds.push(processedFeed);
  }

  return {
    feeds,
    fetchedAt: fetchTimestamp,
  };
}

import type { SourceCachedFeed } from '../schema.ts';
import { fetchFeed } from './fetch-feed.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { mergeFeedCache } from './merge-feed-cache.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';
import type { ModelConfig } from './model-config.ts';
import { processFeedForSource } from './process-feed-for-source.ts';
import { readRawFeedCache } from './read-raw-feed-cache.ts';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import { writeRawFeedCache } from './write-raw-feed-cache.ts';
import { writeSourceFeedCache } from './write-source-feed-cache.ts';
import { getUnprocessedItemsForSource } from './get-unprocessed-items-for-source.ts';
import { buildSourceFeedCacheFromDelta } from './build-source-feed-cache-from-delta.ts';

export type FetchSourceOptions = {
  cacheRoot: string;
  sourcePath: string;
  model?: ModelConfig;
};

export type FetchSourceResult = {
  feeds: SourceCachedFeed[];
  fetchedAt: string;
};

export async function fetchSource(options: FetchSourceOptions): Promise<FetchSourceResult> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const fetchTimestamp = new Date().toISOString();
  const sourceHash = await hashSourcePath(options.sourcePath);
  const filterPrompt = definition.filter?.prompt?.trim() ?? null;

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const feeds: SourceCachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const cachePath = getFeedCachePath(options.cacheRoot, feedUrl);

    const previousFeed = await readRawFeedCache(cachePath);
    const fetchedFeed = await fetchFeed(feedUrl, fetchTimestamp);

    const mergedFeed = mergeFeedCache(previousFeed, fetchedFeed);

    await writeRawFeedCache(cachePath, mergedFeed);

    const processedCachePath = getSourceFeedCachePath(options.cacheRoot, sourceHash, feedUrl);

    if (!filterPrompt) {
      await writeSourceFeedCache(processedCachePath, mergedFeed);
      feeds.push(mergedFeed);
      continue;
    }

    const previousProcessed = await readSourceFeedCache(processedCachePath);
    const { unprocessedItems, keptLinks, omittedLinks } = getUnprocessedItemsForSource({
      mergedFeed,
      previousProcessed,
    });

    const selectedLinks = new Set<string>();
    if (unprocessedItems.length > 0) {
      const processedDelta = await processFeedForSource({
        sourcePath: options.sourcePath,
        feedUrl,
        feed: { ...mergedFeed, items: unprocessedItems },
        filter: { prompt: filterPrompt },
        model: options.model,
      });
      for (const item of processedDelta.items) {
        selectedLinks.add(item.link);
      }
    }

    const processedFeed = buildSourceFeedCacheFromDelta({
      mergedFeed,
      unprocessedItems,
      selectedLinks,
      keptLinks,
      omittedLinks,
    });

    await writeSourceFeedCache(processedCachePath, processedFeed);
    feeds.push(processedFeed);
  }

  return {
    feeds,
    fetchedAt: fetchTimestamp,
  };
}

import type { SourceCachedFeed } from '../schema.ts';
import type { CacheStore } from './cache-store.ts';
import type { ModelConfig } from './model-config.ts';
import { buildSourceFeedCacheFromDelta } from './build-source-feed-cache-from-delta.ts';
import { getUnprocessedItemsForSource } from './get-unprocessed-items-for-source.ts';
import { processFeedForSource } from './process-feed-for-source.ts';

export type UpdateSourceFeedCacheOptions = {
  cacheStore: CacheStore;
  sourceId: string;
  sourcePath: string;
  feedUrl: string;
  mergedFeed: SourceCachedFeed;
  filterPrompt: string | null;
  model?: ModelConfig;
};

export async function updateSourceFeedCache(
  options: UpdateSourceFeedCacheOptions,
): Promise<SourceCachedFeed> {
  if (!options.filterPrompt) {
    await options.cacheStore.writeSourceFeed(options.sourceId, options.feedUrl, options.mergedFeed);
    return options.mergedFeed;
  }

  const previousProcessed = await options.cacheStore.readSourceFeed(
    options.sourceId,
    options.feedUrl,
  );
  const { unprocessedItems, keptLinks, omittedLinks } = getUnprocessedItemsForSource({
    mergedFeed: options.mergedFeed,
    previousProcessed,
  });

  const selectedLinks = new Set<string>();

  if (unprocessedItems.length > 0) {
    const processedDelta = await processFeedForSource({
      sourcePath: options.sourcePath,
      feedUrl: options.feedUrl,
      feed: { ...options.mergedFeed, items: unprocessedItems },
      filter: { prompt: options.filterPrompt },
      model: options.model,
    });

    for (const item of processedDelta.items) {
      selectedLinks.add(item.link);
    }
  }

  const processedFeed = buildSourceFeedCacheFromDelta({
    mergedFeed: options.mergedFeed,
    unprocessedItems,
    selectedLinks,
    keptLinks,
    omittedLinks,
  });

  await options.cacheStore.writeSourceFeed(options.sourceId, options.feedUrl, processedFeed);

  return processedFeed;
}

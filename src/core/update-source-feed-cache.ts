import type { SourceCachedFeed } from '../schema.ts';
import type { ModelConfig } from './model-config.ts';
import { buildSourceFeedCacheFromDelta } from './build-source-feed-cache-from-delta.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { getUnprocessedItemsForSource } from './get-unprocessed-items-for-source.ts';
import { processFeedForSource } from './process-feed-for-source.ts';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import { writeSourceFeedCache } from './write-source-feed-cache.ts';

export type UpdateSourceFeedCacheOptions = {
  cacheRoot: string;
  sourceHash: string;
  sourcePath: string;
  feedUrl: string;
  mergedFeed: SourceCachedFeed;
  filterPrompt: string | null;
  model?: ModelConfig;
};

export async function updateSourceFeedCache(
  options: UpdateSourceFeedCacheOptions,
): Promise<SourceCachedFeed> {
  const cachePath = getSourceFeedCachePath(options.cacheRoot, options.sourceHash, options.feedUrl);

  if (!options.filterPrompt) {
    await writeSourceFeedCache(cachePath, options.mergedFeed);
    return options.mergedFeed;
  }

  const previousProcessed = await readSourceFeedCache(cachePath);
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

  await writeSourceFeedCache(cachePath, processedFeed);

  return processedFeed;
}

import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';
import type { ModelConfig } from './model-config.ts';
import { processFeedForSource } from './process-feed-for-source.ts';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import { writeSourceFeedCache } from './write-source-feed-cache.ts';

export type UpdateSourceFeedCacheOptions = {
  processedCachePath: string;
  sourcePath: string;
  feedUrl: string;
  mergedFeed: RawCachedFeed;
  filterPrompt: string | null;
  model?: ModelConfig;
};

export async function updateSourceFeedCache(
  options: UpdateSourceFeedCacheOptions,
): Promise<SourceCachedFeed> {
  if (!options.filterPrompt) {
    await writeSourceFeedCache(options.processedCachePath, options.mergedFeed);
    return options.mergedFeed;
  }

  const previousProcessed = await readSourceFeedCache(options.processedCachePath);

  const keptLinks = new Set<string>(previousProcessed?.items.map((item) => item.link) ?? []);
  const omittedLinks = new Set<string>(previousProcessed?.omittedLinks ?? []);
  const processedLinks = new Set<string>([...keptLinks, ...omittedLinks]);

  const unprocessedItems = options.mergedFeed.items.filter(
    (item) => !processedLinks.has(item.link),
  );

  if (unprocessedItems.length > 0) {
    const processedDelta = await processFeedForSource({
      sourcePath: options.sourcePath,
      feedUrl: options.feedUrl,
      feed: { ...options.mergedFeed, items: unprocessedItems },
      filter: { prompt: options.filterPrompt },
      model: options.model,
    });

    const selectedLinks = new Set<string>(processedDelta.items.map((item) => item.link));
    for (const item of unprocessedItems) {
      if (selectedLinks.has(item.link)) {
        keptLinks.add(item.link);
        continue;
      }
      omittedLinks.add(item.link);
    }
  }

  const processedFeed: SourceCachedFeed = {
    ...options.mergedFeed,
    omittedLinks: Array.from(omittedLinks),
    items: options.mergedFeed.items.filter((item) => keptLinks.has(item.link)),
  };

  await writeSourceFeedCache(options.processedCachePath, processedFeed);
  return processedFeed;
}

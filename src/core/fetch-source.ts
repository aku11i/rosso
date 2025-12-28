import type { SourceCachedFeed } from '../schema.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import type { CacheStore } from './cache-store.ts';
import type { ModelConfig } from './model-config.ts';
import { getUniqueFeedUrls } from './get-unique-feed-urls.ts';
import { updateRawFeedCache } from './update-raw-feed-cache.ts';
import { updateSourceFeedCache } from './update-source-feed-cache.ts';

export type FetchSourceOptions = {
  cacheStore: CacheStore;
  sourcePath: string;
  model?: ModelConfig;
};

export type FetchSourceResult = {
  feeds: SourceCachedFeed[];
  fetchedAt: string;
};

export async function fetchSource(options: FetchSourceOptions): Promise<FetchSourceResult> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const fetchedAt = new Date().toISOString();
  const { sourceId } = definition;
  const filterPrompt = definition.filter?.prompt?.trim() ?? null;

  const feedUrls = getUniqueFeedUrls(definition.feeds);

  const feeds: SourceCachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const mergedFeed = await updateRawFeedCache({
      cacheStore: options.cacheStore,
      feedUrl,
      fetchedAt,
    });

    const processedFeed = await updateSourceFeedCache({
      cacheStore: options.cacheStore,
      sourceId,
      sourcePath: options.sourcePath,
      feedUrl,
      mergedFeed,
      filterPrompt,
      model: options.model,
    });

    feeds.push(processedFeed);
  }

  return {
    feeds,
    fetchedAt,
  };
}

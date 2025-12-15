import type { SourceCachedFeed } from '../schema.ts';
import { fetchFeed } from './fetch-feed.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { mergeFeedCache } from './merge-feed-cache.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';
import type { ModelConfig } from './model-config.ts';
import { readRawFeedCache } from './read-raw-feed-cache.ts';
import { writeRawFeedCache } from './write-raw-feed-cache.ts';
import { updateSourceFeedCache } from './update-source-feed-cache.ts';

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
  const filterPrompt = definition.filter?.prompt?.trim();

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
    const processedFeed = await updateSourceFeedCache({
      processedCachePath,
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
    fetchedAt: fetchTimestamp,
  };
}

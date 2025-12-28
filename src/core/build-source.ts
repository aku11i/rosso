import { Feed } from 'feed';
import type { SourceCachedFeed } from '../schema.ts';
import { aggregateFeedItems } from './aggregate-feed-items.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { getSourceIdFromPath } from '../utils/get-source-id-from-path.ts';
import type { CacheStore } from './cache-store.ts';

export type BuildSourceOptions = {
  cacheStore: CacheStore;
  sourcePath: string;
};

export async function buildSource(options: BuildSourceOptions): Promise<string> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const sourceId = await getSourceIdFromPath(options.sourcePath);

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const cachedFeeds: SourceCachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const processedCached = await options.cacheStore.readSourceFeed(sourceId, feedUrl);
    if (!processedCached) {
      throw new Error(
        `Missing cache for ${feedUrl}. Run "rosso fetch ${options.sourcePath}" first.`,
      );
    }
    cachedFeeds.push(processedCached);
  }

  const items = aggregateFeedItems(cachedFeeds);

  const feed = new Feed({
    title: definition.name,
    description: definition.description,
    id: definition.link,
    link: definition.link,
    copyright: '',
    updated: new Date(),
    generator: 'rosso',
  });

  for (const item of items) {
    feed.addItem(item);
  }

  return feed.rss2();
}

import { Feed } from 'feed';
import type { CachedFeed } from '../schema.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { aggregateFeedItems } from './aggregate-feed-items.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { readFeedCache } from './read-feed-cache.ts';

export type BuildSourceOptions = {
  cacheRoot: string;
  sourcePath: string;
};

export async function buildSource(options: BuildSourceOptions): Promise<string> {
  const definition = await loadSourceDefinition(options.sourcePath);

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const cachedFeeds: CachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const cachePath = getFeedCachePath(options.cacheRoot, feedUrl);
    const cached = await readFeedCache(cachePath);
    if (!cached) {
      throw new Error(
        `Missing cache for ${feedUrl} (${cachePath}). Run "rosso fetch ${options.sourcePath}" first.`,
      );
    }
    cachedFeeds.push(cached);
  }

  const items = aggregateFeedItems(cachedFeeds);

  const feed = new Feed({
    title: definition.name,
    description: definition.description,
    id: definition.link,
    link: definition.link,
    updated: new Date(),
    generator: 'rosso',
  });

  for (const item of items) {
    feed.addItem(item);
  }

  return feed.rss2();
}

import { Feed } from 'feed';
import type { SourceCachedFeed } from '../schema.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { aggregateFeedItems } from './aggregate-feed-items.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';

export type BuildSourceOptions = {
  cacheRoot: string;
  sourcePath: string;
};

export async function buildSource(options: BuildSourceOptions): Promise<string> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const sourceHash = await hashSourcePath(options.sourcePath);

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const cachedFeeds: SourceCachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const processedCachePath = getSourceFeedCachePath(options.cacheRoot, sourceHash, feedUrl);
    const processedCached = await readSourceFeedCache(processedCachePath);
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

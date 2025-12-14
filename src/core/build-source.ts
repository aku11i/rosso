import { Feed } from 'feed';
import type { CachedFeed } from '../schema.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
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

  const seen = new Set<string>();
  const items: { id: string; title: string; link: string; description?: string; date: Date }[] =
    [];

  for (const cachedFeed of cachedFeeds) {
    for (const item of cachedFeed.items) {
      const key = `${cachedFeed.url}\n${item.link}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const date = new Date(item.timestamp);
      if (Number.isNaN(date.valueOf())) {
        throw new Error(
          `Invalid timestamp in cache for ${cachedFeed.url}: ${item.timestamp} (${options.sourcePath})`,
        );
      }

      items.push({
        id: `${cachedFeed.url}\n${item.link}`,
        title: item.title ?? item.link,
        link: item.link,
        description: item.description ?? undefined,
        date,
      });
    }
  }

  items.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.id.localeCompare(b.id));

  const updated = items[0]?.date ?? new Date();

  const feed = new Feed({
    title: definition.name,
    description: definition.description,
    id: definition.link,
    link: definition.link,
    updated,
    generator: 'rosso',
  });

  for (const item of items) {
    feed.addItem(item);
  }

  return feed.rss2();
}

import type { CachedFeed, CachedItem } from '../types.ts';
import { fetchFeed } from './fetch-feed.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { readFeedCache } from './read-feed-cache.ts';
import { writeFeedCache } from './write-feed-cache.ts';

export type FetchSourceOptions = {
  cacheDir: string;
  sourcePath: string;
};

export type FetchSourceResult = {
  cacheDir: string;
  cachePaths: string[];
  feeds: CachedFeed[];
  fetchedAt: string;
};

export async function fetchSource(options: FetchSourceOptions): Promise<FetchSourceResult> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const fetchTimestamp = new Date().toISOString();

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const feeds: CachedFeed[] = [];
  const cachePaths: string[] = [];

  for (const feedUrl of feedUrls) {
    const cachePath = getFeedCachePath(options.cacheDir, feedUrl);
    cachePaths.push(cachePath);

    const previousFeed = await readFeedCache(cachePath);
    const fetchedFeed = await fetchFeed(feedUrl, fetchTimestamp);

    const combinedItems: CachedItem[] = [];
    const seenLinks = new Set<string>();

    for (const item of previousFeed?.items ?? []) {
      if (seenLinks.has(item.link)) {
        continue;
      }
      seenLinks.add(item.link);
      combinedItems.push(item);
    }

    for (const item of fetchedFeed.items) {
      if (seenLinks.has(item.link)) {
        for (let index = 0; index < combinedItems.length; index += 1) {
          if (combinedItems[index].link === item.link) {
            combinedItems[index] = item;
            break;
          }
        }
        continue;
      }

      seenLinks.add(item.link);
      combinedItems.push(item);
    }

    const mergedFeed: CachedFeed = {
      title: fetchedFeed.title ?? previousFeed?.title ?? null,
      description: fetchedFeed.description ?? previousFeed?.description ?? null,
      url: feedUrl,
      items: combinedItems,
    };

    await writeFeedCache(cachePath, mergedFeed);
    feeds.push(mergedFeed);
  }

  return {
    cacheDir: options.cacheDir,
    cachePaths,
    feeds,
    fetchedAt: fetchTimestamp,
  };
}

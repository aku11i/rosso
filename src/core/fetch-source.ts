import type { CachedFeed, CachedItem, SourceCache } from '../types.ts';
import { fetchFeedItems } from './fetch-feed-items.ts';
import { getCacheFilePath } from './get-cache-file-path.ts';
import { loadSourceDefinition } from './load-source-definition.ts';
import { readCacheFile } from './read-cache-file.ts';
import { writeCacheFile } from './write-cache-file.ts';

export type FetchSourceOptions = {
  cacheDir: string;
  sourcePath: string;
};

export type FetchSourceResult = {
  cachePath: string;
  cache: SourceCache;
};

export async function fetchSource(options: FetchSourceOptions): Promise<FetchSourceResult> {
  const definition = await loadSourceDefinition(options.sourcePath);
  const cachePath = getCacheFilePath(options.cacheDir, definition.name);
  const previousCache = await readCacheFile(cachePath);
  const fetchTimestamp = new Date().toISOString();

  const feedUrls = new Set<string>();
  for (const feed of definition.feeds) {
    if (!feedUrls.has(feed.url)) {
      feedUrls.add(feed.url);
    }
  }

  const feeds: CachedFeed[] = [];
  for (const feedUrl of feedUrls) {
    const newItems = await fetchFeedItems(feedUrl, fetchTimestamp);

    let existingItems: CachedItem[] = [];
    if (previousCache) {
      for (const feed of previousCache.feeds) {
        if (feed.url === feedUrl) {
          existingItems = feed.items;
          break;
        }
      }
    }

    const combinedItems: CachedItem[] = [];
    const seenLinks = new Set<string>();

    for (const item of existingItems) {
      if (seenLinks.has(item.link)) {
        continue;
      }
      seenLinks.add(item.link);
      combinedItems.push(item);
    }

    for (const item of newItems) {
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

    feeds.push({
      url: feedUrl,
      items: combinedItems,
    });
  }

  const cache: SourceCache = {
    source: {
      name: definition.name,
      description: definition.description,
      link: definition.link,
    },
    fetchedAt: fetchTimestamp,
    feeds,
  };

  await writeCacheFile(cachePath, cache);

  return {
    cachePath,
    cache,
  };
}

import type { RawCachedFeed, CachedItem } from '../schema.ts';

export function mergeFeedCache(
  previousFeed: RawCachedFeed | null,
  fetchedFeed: RawCachedFeed,
): RawCachedFeed {
  const combinedItems: CachedItem[] = [];

  for (const item of previousFeed?.items ?? []) {
    if (combinedItems.some((existing) => existing.link === item.link)) {
      continue;
    }
    combinedItems.push(item);
  }

  for (const item of fetchedFeed.items) {
    const index = combinedItems.findIndex((existing) => existing.link === item.link);
    if (index >= 0) {
      combinedItems[index] = { ...item, timestamp: combinedItems[index]?.timestamp ?? item.timestamp };
      continue;
    }
    combinedItems.push(item);
  }

  return {
    title: fetchedFeed.title ?? previousFeed?.title ?? null,
    description: fetchedFeed.description ?? previousFeed?.description ?? null,
    url: fetchedFeed.url,
    items: combinedItems,
  };
}

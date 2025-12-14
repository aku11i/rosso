import type { CachedFeed } from '../schema.ts';
import { isValidDate } from '../utils/is-valid-date.ts';

export type AggregatedItem = {
  id: string;
  title: string;
  link: string;
  description?: string;
  date: Date;
};

export function aggregateFeedItems(cachedFeeds: CachedFeed[]) {
  const seen = new Set<string>();
  const items: AggregatedItem[] = [];

  for (const cachedFeed of cachedFeeds) {
    for (const item of cachedFeed.items) {
      const key = `${cachedFeed.url}\n${item.link}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const date = new Date(item.timestamp);
      if (!isValidDate(date)) {
        throw new Error(
          `Invalid timestamp in cache for ${cachedFeed.url}: ${item.timestamp}`,
        );
      }

      items.push({
        id: key,
        title: item.title ?? item.link,
        link: item.link,
        description: item.description ?? undefined,
        date,
      });
    }
  }

  items.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.id.localeCompare(b.id));

  return items;
}

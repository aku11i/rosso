import { parseFeed } from '@rowanmanning/feed-parser';
import type { CachedItem } from '../types.ts';

export async function fetchFeedItems(
  feedUrl: string,
  fetchTimestamp: string,
): Promise<CachedItem[]> {
  const response = await fetch(feedUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedUrl}: ${response.status} ${response.statusText}`);
  }

  const xmlContent = await response.text();
  const feed = parseFeed(xmlContent);

  const seenLinks = new Set<string>();
  const items: CachedItem[] = [];

  for (const item of feed.items) {
    const link = item.url ? item.url.trim() : '';
    if (!link || seenLinks.has(link)) {
      continue;
    }

    seenLinks.add(link);

    const timestampSource = item.published ?? item.updated;
    const timestamp =
      timestampSource instanceof Date ? timestampSource.toISOString() : fetchTimestamp;
    const description = item.description ?? item.content ?? null;

    items.push({
      title: item.title ?? null,
      description,
      link,
      timestamp,
    });
  }

  return items;
}

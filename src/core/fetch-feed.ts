import { parseFeed } from '@rowanmanning/feed-parser';
import type { CachedFeed, CachedItem } from '../schema.ts';

export async function fetchFeed(
  feedUrl: string,
  fetchTimestamp: string,
): Promise<CachedFeed> {
  const response = await fetch(feedUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedUrl}: ${response.status} ${response.statusText}`);
  }

  const xmlContent = await response.text();
  const feed = parseFeed(xmlContent);

  const items: CachedItem[] = [];

  for (const item of feed.items) {
    const link = item.url ? item.url.trim() : '';
    if (!link || items.some((existing) => existing.link === link)) {
      continue;
    }

    const timestampSource = item.published ?? item.updated;
    const timestamp =
      timestampSource instanceof Date ? timestampSource.toISOString() : fetchTimestamp;
    const description = item.description ?? null;

    items.push({
      title: item.title ?? null,
      description,
      link,
      timestamp,
    });
  }

  return {
    title: feed.title ?? null,
    description: feed.description ?? null,
    url: feedUrl,
    items,
  };
}

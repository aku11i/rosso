import type { FeedEntry } from '../schema.ts';

export function getUniqueFeedUrls(feeds: ReadonlyArray<FeedEntry>): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const feed of feeds) {
    if (seen.has(feed.url)) {
      continue;
    }
    seen.add(feed.url);
    urls.push(feed.url);
  }

  return urls;
}

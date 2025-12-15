import type { CachedItem } from '../schema.ts';

export function sortCachedItemsByTimestampDesc(items: CachedItem[]): CachedItem[] {
  return items
    .map((item, index) => {
      const timestampMs = Date.parse(item.timestamp);
      return {
        item,
        index,
        timestampMs: Number.isNaN(timestampMs) ? Number.NEGATIVE_INFINITY : timestampMs,
      };
    })
    .sort((a, b) => b.timestampMs - a.timestampMs || a.index - b.index)
    .map(({ item }) => item);
}

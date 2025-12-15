import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';

export type UnprocessedItemsForSource = {
  unprocessedItems: RawCachedFeed['items'];
  keptLinks: Set<string>;
  omittedLinks: Set<string>;
};

export type GetUnprocessedItemsForSourceOptions = {
  mergedFeed: RawCachedFeed;
  previousProcessed: SourceCachedFeed | null;
};

export function getUnprocessedItemsForSource(
  options: GetUnprocessedItemsForSourceOptions,
): UnprocessedItemsForSource {
  const keptLinks = new Set<string>(
    options.previousProcessed?.items.map((item) => item.link) ?? [],
  );
  const omittedLinks = new Set<string>(options.previousProcessed?.omittedLinks ?? []);
  const processedLinks = new Set<string>([...keptLinks, ...omittedLinks]);

  const unprocessedItems = options.mergedFeed.items.filter(
    (item) => !processedLinks.has(item.link),
  );

  return { unprocessedItems, keptLinks, omittedLinks };
}

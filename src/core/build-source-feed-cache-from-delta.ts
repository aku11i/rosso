import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';

export type BuildSourceFeedCacheFromDeltaOptions = {
  mergedFeed: RawCachedFeed;
  unprocessedItems: RawCachedFeed['items'];
  selectedLinks: Set<string>;
  keptLinks: Set<string>;
  omittedLinks: Set<string>;
};

export function buildSourceFeedCacheFromDelta(
  options: BuildSourceFeedCacheFromDeltaOptions,
): SourceCachedFeed {
  for (const item of options.unprocessedItems) {
    if (options.selectedLinks.has(item.link)) {
      options.keptLinks.add(item.link);
      continue;
    }
    options.omittedLinks.add(item.link);
  }

  return {
    ...options.mergedFeed,
    omittedLinks: Array.from(options.omittedLinks),
    items: options.mergedFeed.items.filter((item) => options.keptLinks.has(item.link)),
  };
}

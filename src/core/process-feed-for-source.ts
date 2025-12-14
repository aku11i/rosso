import type { CachedFeed } from '../schema.ts';

export type ProcessFeedForSourceOptions = {
  sourcePath: string;
  feedUrl: string;
  feed: CachedFeed;
};

export function processFeedForSource(options: ProcessFeedForSourceOptions): CachedFeed {
  return options.feed;
}

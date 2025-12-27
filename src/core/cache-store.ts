import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';

export type CacheStore = {
  readRawFeed: (feedUrl: string) => Promise<RawCachedFeed | null>;
  writeRawFeed: (feedUrl: string, feed: RawCachedFeed) => Promise<void>;
  readSourceFeed: (sourceId: string, feedUrl: string) => Promise<SourceCachedFeed | null>;
  writeSourceFeed: (sourceId: string, feedUrl: string, feed: SourceCachedFeed) => Promise<void>;
  close?: () => Promise<void>;
};

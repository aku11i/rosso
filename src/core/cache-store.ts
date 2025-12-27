import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';

export type CacheStore = {
  readRawFeed: (feedUrl: string) => Promise<RawCachedFeed | null>;
  writeRawFeed: (feedUrl: string, feed: RawCachedFeed) => Promise<void>;
  readSourceFeed: (sourceHash: string, feedUrl: string) => Promise<SourceCachedFeed | null>;
  writeSourceFeed: (sourceHash: string, feedUrl: string, feed: SourceCachedFeed) => Promise<void>;
  close?: () => Promise<void>;
};

export type { FeedEntry, SourceDefinition } from './schema.ts';

export type CachedItem = {
  title: string | null;
  description: string | null;
  link: string;
  timestamp: string;
};

export type CachedFeed = {
  title: string | null;
  description: string | null;
  url: string;
  items: CachedItem[];
};

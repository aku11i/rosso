export type FeedEntry = {
  type: 'rss';
  url: string;
};

export type SourceDefinition = {
  name: string;
  description: string;
  link: string;
  feeds: FeedEntry[];
};

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

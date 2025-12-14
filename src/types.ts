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
  url: string;
  items: CachedItem[];
};

export type SourceCache = {
  source: {
    name: string;
    description: string;
    link: string;
  };
  fetchedAt: string;
  feeds: CachedFeed[];
};

import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';
import { createFileSystemCacheStore } from './create-file-system-cache-store.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';

const rssFeedWithItems = (items: Array<{ title: string; link: string; pubDate: string }>) =>
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    `  <channel>`,
    `    <title>Feed</title>`,
    ...items.flatMap((item) => [
      `    <item>`,
      `      <title>${item.title}</title>`,
      `      <link>${item.link}</link>`,
      `      <pubDate>${item.pubDate}</pubDate>`,
      `    </item>`,
    ]),
    `  </channel>`,
    `</rss>`,
  ].join('\n');

let callCount = 0;
let lastProcessOptions: unknown;

mock.module('./process-feed-for-source.ts', {
  namedExports: {
    processFeedForSource: async (options: unknown) => {
      callCount++;
      lastProcessOptions = options;

      const feed = (options as { feed?: RawCachedFeed }).feed;
      assert.ok(feed, 'expected feed');

      return { ...feed, items: feed.items } as never;
    },
  },
});

let fetchSource: typeof import('./fetch-source.ts').fetchSource;

test.before(async () => {
  ({ fetchSource } = await import('./fetch-source.ts'));
});

test.beforeEach(() => {
  callCount = 0;
  lastProcessOptions = undefined;
});

test('fetchSource passes only unprocessed items to processFeedForSource', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-fetch-source-omit-'));
  const cacheRoot = path.join(tempDir, 'cache');
  const cacheStore = createFileSystemCacheStore(cacheRoot);
  const sourcePath = path.join(tempDir, 'source.yaml');
  const filterPrompt = 'Keep only items related to X';

  await writeFile(
    sourcePath,
    [
      'name: Example Source',
      'description: Demo source',
      'link: https://example.com',
      'filter:',
      `  prompt: ${JSON.stringify(filterPrompt)}`,
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
    'utf8',
  );

  const feedUrl = 'https://example.com/feed.xml';
  const rawCachePath = getFeedCachePath(cacheRoot, feedUrl);
  const previousRaw: RawCachedFeed = {
    title: 'Feed',
    description: null,
    url: feedUrl,
    items: [
      {
        title: 'A',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-03-30T00:00:00.000Z',
      },
      {
        title: 'B',
        description: null,
        link: 'https://example.com/b',
        timestamp: '2024-03-30T00:00:00.000Z',
      },
    ],
  };
  await mkdir(path.dirname(rawCachePath), { recursive: true });
  await writeFile(rawCachePath, JSON.stringify(previousRaw), 'utf8');

  const sourceHash = await hashSourcePath(sourcePath);
  const processedCachePath = getSourceFeedCachePath(cacheRoot, sourceHash, feedUrl);
  const previousProcessed: SourceCachedFeed = {
    title: 'Feed',
    description: null,
    url: feedUrl,
    omittedLinks: ['https://example.com/b'],
    items: [
      {
        title: 'A',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-03-30T00:00:00.000Z',
      },
    ],
  };
  await mkdir(path.dirname(processedCachePath), { recursive: true });
  await writeFile(processedCachePath, JSON.stringify(previousProcessed), 'utf8');

  const rss = rssFeedWithItems([
    { title: 'A', link: 'https://example.com/a', pubDate: 'Mon, 01 Apr 2024 00:00:00 GMT' },
    { title: 'B', link: 'https://example.com/b', pubDate: 'Mon, 01 Apr 2024 00:00:00 GMT' },
    { title: 'C', link: 'https://example.com/c', pubDate: 'Mon, 01 Apr 2024 00:00:00 GMT' },
  ]);

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => rss,
  }));

  const result = await fetchSource({ cacheStore, sourcePath });
  assert.equal(result.feeds.length, 1);

  assert.equal(callCount, 1);
  const fedItems = (lastProcessOptions as { feed: RawCachedFeed }).feed.items;
  assert.deepEqual(
    fedItems.map((item) => item.link),
    ['https://example.com/c'],
  );

  const diskProcessed = JSON.parse(await readFile(processedCachePath, 'utf8')) as SourceCachedFeed;
  assert.deepEqual(
    diskProcessed.items.map((item) => item.link),
    ['https://example.com/a', 'https://example.com/c'],
  );
  assert.deepEqual(diskProcessed.omittedLinks, ['https://example.com/b']);

  fetchMock.mock.restore();
});

test('fetchSource skips processFeedForSource when there are no unprocessed items', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-fetch-source-omit-empty-'));
  const cacheRoot = path.join(tempDir, 'cache');
  const cacheStore = createFileSystemCacheStore(cacheRoot);
  const sourcePath = path.join(tempDir, 'source.yaml');
  const filterPrompt = 'Keep only items related to X';

  await writeFile(
    sourcePath,
    [
      'name: Example Source',
      'description: Demo source',
      'link: https://example.com',
      'filter:',
      `  prompt: ${JSON.stringify(filterPrompt)}`,
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
    'utf8',
  );

  const feedUrl = 'https://example.com/feed.xml';

  const rawCachePath = getFeedCachePath(cacheRoot, feedUrl);
  const previousRaw: RawCachedFeed = {
    title: 'Feed',
    description: null,
    url: feedUrl,
    items: [
      {
        title: 'A',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
      {
        title: 'B',
        description: null,
        link: 'https://example.com/b',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  };
  await mkdir(path.dirname(rawCachePath), { recursive: true });
  await writeFile(rawCachePath, JSON.stringify(previousRaw), 'utf8');

  const sourceHash = await hashSourcePath(sourcePath);
  const processedCachePath = getSourceFeedCachePath(cacheRoot, sourceHash, feedUrl);
  const previousProcessed: SourceCachedFeed = {
    title: 'Feed',
    description: null,
    url: feedUrl,
    omittedLinks: ['https://example.com/b'],
    items: [
      {
        title: 'A',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  };
  await mkdir(path.dirname(processedCachePath), { recursive: true });
  await writeFile(processedCachePath, JSON.stringify(previousProcessed), 'utf8');

  const rss = rssFeedWithItems([
    { title: 'A', link: 'https://example.com/a', pubDate: 'Mon, 01 Apr 2024 00:00:00 GMT' },
    { title: 'B', link: 'https://example.com/b', pubDate: 'Mon, 01 Apr 2024 00:00:00 GMT' },
  ]);

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => rss,
  }));

  await fetchSource({ cacheStore, sourcePath });
  assert.equal(callCount, 0);
  assert.equal(lastProcessOptions, undefined);

  fetchMock.mock.restore();
});

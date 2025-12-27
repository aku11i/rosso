import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { RawCachedFeed } from '../schema.ts';
import { createFileSystemCacheStore } from './create-file-system-cache-store.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { updateRawFeedCache } from './update-raw-feed-cache.ts';

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed</title>
    <item>
      <title>Fresh</title>
      <link>https://example.com/a</link>
      <pubDate>Mon, 01 Apr 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

test('updateRawFeedCache fetches, merges, and writes raw cache', async () => {
  const cacheRoot = await mkdtemp(path.join(os.tmpdir(), 'rosso-update-raw-'));
  const cacheStore = createFileSystemCacheStore(cacheRoot);
  const feedUrl = 'https://example.com/feed.xml';
  const cachePath = getFeedCachePath(cacheRoot, feedUrl);

  const previousCache: RawCachedFeed = {
    title: 'Old title',
    description: null,
    url: feedUrl,
    items: [
      {
        title: 'Old',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-03-30T00:00:00.000Z',
      },
    ],
  };
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(previousCache), 'utf8');

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => rssFeed,
  }));

  const mergedFeed = await updateRawFeedCache({
    cacheStore,
    feedUrl,
    fetchedAt: '2024-05-01T00:00:00.000Z',
  });

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(mergedFeed.title, 'Feed');
  assert.equal(mergedFeed.items.length, 1);
  assert.equal(mergedFeed.items[0].title, 'Fresh');
  assert.equal(mergedFeed.items[0].timestamp, '2024-03-30T00:00:00.000Z');

  const diskCache = JSON.parse(await readFile(cachePath, 'utf8')) as RawCachedFeed;
  assert.equal(diskCache.items[0].title, 'Fresh');

  fetchMock.mock.restore();
});

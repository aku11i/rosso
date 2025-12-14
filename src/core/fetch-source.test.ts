import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fetchSource } from './fetch-source.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import type { CachedFeed } from '../schema.ts';

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

test('fetchSource dedupes feeds and merges cache', async () => {
  const cacheDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-fetch-source-'));
  const sourcePath = path.join(cacheDir, 'source.yaml');
  await writeFile(
    sourcePath,
    [
      'name: Example Source',
      'description: Demo source',
      'link: https://example.com',
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
    'utf8',
  );

  const cachePath = getFeedCachePath(cacheDir, 'https://example.com/feed.xml');
  const previousCache: CachedFeed = {
    title: 'Old title',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'Old',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-03-30T00:00:00.000Z',
      },
    ],
  };
  await writeFile(cachePath, JSON.stringify(previousCache), 'utf8');

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => rssFeed,
  }));

  const result = await fetchSource({ cacheDir, sourcePath });

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(result.cachePaths[0], cachePath);
  assert.equal(result.feeds.length, 1);
  const items = result.feeds[0].items;
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Fresh');
  assert.equal(items[0].timestamp, '2024-04-01T00:00:00.000Z');
  assert.ok(Date.parse(result.fetchedAt));

  const diskCache = JSON.parse(await readFile(cachePath, 'utf8')) as CachedFeed;
  assert.equal(diskCache.title, 'Feed');
  assert.equal(diskCache.items[0].title, 'Fresh');

  fetchMock.mock.restore();
});

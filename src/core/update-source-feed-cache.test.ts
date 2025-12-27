import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { SourceCachedFeed } from '../schema.ts';
import { createFileSystemCacheStore } from './create-file-system-cache-store.ts';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { updateSourceFeedCache } from './update-source-feed-cache.ts';

test('updateSourceFeedCache writes merged feed when no filter is set', async () => {
  const cacheRoot = await mkdtemp(path.join(os.tmpdir(), 'rosso-update-source-'));
  const cacheStore = createFileSystemCacheStore(cacheRoot);
  const sourceHash = 'source-hash';
  const sourcePath = path.join(cacheRoot, 'source.yaml');
  await writeFile(sourcePath, 'name: a\ndescription: b\nlink: c\nfeeds: []\n', 'utf8');

  const feedUrl = 'https://example.com/feed.xml';
  const mergedFeed: SourceCachedFeed = {
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
    ],
  };

  const processed = await updateSourceFeedCache({
    cacheStore,
    sourceHash,
    sourcePath,
    feedUrl,
    mergedFeed,
    filterPrompt: null,
  });

  assert.deepEqual(processed, mergedFeed);

  const cachePath = getSourceFeedCachePath(cacheRoot, sourceHash, feedUrl);
  const diskCache = JSON.parse(await readFile(cachePath, 'utf8')) as SourceCachedFeed;
  assert.deepEqual(diskCache, mergedFeed);
});

test('updateSourceFeedCache skips processing when there are no unprocessed items', async () => {
  const cacheRoot = await mkdtemp(path.join(os.tmpdir(), 'rosso-update-source-skip-'));
  const cacheStore = createFileSystemCacheStore(cacheRoot);
  const sourceHash = 'source-hash';
  const sourcePath = path.join(cacheRoot, 'source.yaml');
  await writeFile(sourcePath, 'name: a\ndescription: b\nlink: c\nfeeds: []\n', 'utf8');

  const feedUrl = 'https://example.com/feed.xml';
  const cachePath = getSourceFeedCachePath(cacheRoot, sourceHash, feedUrl);
  await mkdir(path.dirname(cachePath), { recursive: true });

  const previousProcessed: SourceCachedFeed = {
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
    ],
    omittedLinks: ['https://example.com/b'],
  };
  await writeFile(cachePath, JSON.stringify(previousProcessed), 'utf8');

  const mergedFeed: SourceCachedFeed = {
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
        timestamp: '2024-04-02T00:00:00.000Z',
      },
    ],
  };

  const processed = await updateSourceFeedCache({
    cacheStore,
    sourceHash,
    sourcePath,
    feedUrl,
    mergedFeed,
    filterPrompt: 'keep only relevant items',
  });

  assert.deepEqual(
    processed.items.map((item) => item.link),
    ['https://example.com/a'],
  );
  assert.deepEqual(processed.omittedLinks, ['https://example.com/b']);
});

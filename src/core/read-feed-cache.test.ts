import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readFeedCache } from './read-feed-cache.ts';
import type { CachedFeed } from '../types.ts';

test('readFeedCache returns null when missing', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-'));
  const cachePath = path.join(dir, 'feed.json');
  const result = await readFeedCache(cachePath);
  assert.equal(result, null);
});

test('readFeedCache parses existing cache', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-'));
  const cachePath = path.join(dir, 'feed.json');
  const cache: CachedFeed = {
    title: 'Title',
    description: 'Desc',
    url: 'https://example.com/feed.xml',
    items: [{ title: 't', description: 'd', link: 'https://example.com/a', timestamp: '2024' }],
  };
  await writeFile(cachePath, JSON.stringify(cache), 'utf8');

  const result = await readFeedCache(cachePath);
  assert.deepEqual(result, cache);
});

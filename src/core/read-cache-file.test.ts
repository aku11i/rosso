import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readCacheFile } from './read-cache-file.ts';
import type { CachedFeed } from '../types.ts';

test('readCacheFile returns null when missing', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-'));
  const cachePath = path.join(dir, 'feed.json');
  const result = await readCacheFile(cachePath);
  assert.equal(result, null);
});

test('readCacheFile parses existing cache', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-'));
  const cachePath = path.join(dir, 'feed.json');
  const cache: CachedFeed = {
    title: 'Title',
    description: 'Desc',
    url: 'https://example.com/feed.xml',
    items: [{ title: 't', description: 'd', link: 'https://example.com/a', timestamp: '2024' }],
  };
  await writeFile(cachePath, JSON.stringify(cache), 'utf8');

  const result = await readCacheFile(cachePath);
  assert.deepEqual(result, cache);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeFeedCache } from './write-feed-cache.ts';
import type { CachedFeed } from '../schema.ts';

test('writeFeedCache writes JSON cache to disk', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-write-'));
  const cachePath = path.join(dir, 'cache.json');
  const cache: CachedFeed = {
    title: 'Demo',
    description: 'desc',
    url: 'https://example.com/feed.xml',
    items: [],
  };

  await writeFeedCache(cachePath, cache);
  const content = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(content);
  assert.deepEqual(parsed, cache);
  assert.ok(content.endsWith('\n'));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeRawFeedCache } from './write-raw-feed-cache.ts';
import type { RawCachedFeed } from '../schema.ts';

test('writeRawFeedCache writes JSON cache to disk', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-write-raw-'));
  const cachePath = path.join(dir, 'cache.json');
  const cache: RawCachedFeed = {
    title: 'Demo',
    description: 'desc',
    url: 'https://example.com/feed.xml',
    items: [],
  };

  await writeRawFeedCache(cachePath, cache);
  const content = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(content);
  assert.deepEqual(parsed, cache);
  assert.ok(content.endsWith('\n'));
});

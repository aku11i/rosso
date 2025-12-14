import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeCacheFile } from './write-cache-file.ts';
import type { CachedFeed } from '../types.ts';

test('writeCacheFile writes JSON cache to disk', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-write-'));
  const cachePath = path.join(dir, 'cache.json');
  const cache: CachedFeed = {
    title: 'Demo',
    description: 'desc',
    url: 'https://example.com/feed.xml',
    items: [],
  };

  await writeCacheFile(cachePath, cache);
  const content = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(content);
  assert.deepEqual(parsed, cache);
  assert.ok(content.endsWith('\n'));
});

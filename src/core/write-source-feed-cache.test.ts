import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeSourceFeedCache } from './write-source-feed-cache.ts';
import type { SourceCachedFeed } from '../schema.ts';

test('writeSourceFeedCache writes JSON cache to disk', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-write-source-'));
  const cachePath = path.join(dir, 'cache.json');
  const cache: SourceCachedFeed = {
    title: 'Demo',
    description: 'desc',
    url: 'https://example.com/feed.xml',
    omittedLinks: ['https://example.com/omitted'],
    items: [],
  };

  await writeSourceFeedCache(cachePath, cache);
  const content = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(content);
  assert.deepEqual(parsed, cache);
  assert.ok(content.endsWith('\n'));
});

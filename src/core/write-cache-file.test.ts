import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeCacheFile } from './write-cache-file.ts';
import type { SourceCache } from '../types.ts';

test('writeCacheFile writes JSON cache to disk', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-write-'));
  const cachePath = path.join(dir, 'cache.json');
  const cache: SourceCache = {
    source: { name: 'Demo', description: 'desc', link: 'https://example.com' },
    fetchedAt: '2024-01-01T00:00:00.000Z',
    feeds: [],
  };

  await writeCacheFile(cachePath, cache);
  const content = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(content);
  assert.deepEqual(parsed, cache);
  assert.ok(content.endsWith('\n'));
});

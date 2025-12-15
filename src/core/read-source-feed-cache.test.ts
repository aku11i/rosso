import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readSourceFeedCache } from './read-source-feed-cache.ts';
import type { SourceCachedFeed } from '../schema.ts';

test('readSourceFeedCache returns null when missing', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-source-'));
  const cachePath = path.join(dir, 'feed.json');
  const result = await readSourceFeedCache(cachePath);
  assert.equal(result, null);
});

test('readSourceFeedCache parses existing cache', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-source-'));
  const cachePath = path.join(dir, 'feed.json');
  const cache: SourceCachedFeed = {
    title: 'Title',
    description: 'Desc',
    url: 'https://example.com/feed.xml',
    omittedLinks: ['https://example.com/b'],
    items: [{ title: 't', description: 'd', link: 'https://example.com/a', timestamp: '2024' }],
  };
  await writeFile(cachePath, JSON.stringify(cache), 'utf8');

  const result = await readSourceFeedCache(cachePath);
  assert.deepEqual(result, cache);
});

test('readSourceFeedCache returns null for invalid cache content', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-source-'));
  const cachePath = path.join(dir, 'feed.json');
  await writeFile(cachePath, JSON.stringify({ broken: true }), 'utf8');

  const result = await readSourceFeedCache(cachePath);
  assert.equal(result, null);
});

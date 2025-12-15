import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readRawFeedCache } from './read-raw-feed-cache.ts';
import type { RawCachedFeed } from '../schema.ts';

test('readRawFeedCache returns null when missing', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-raw-'));
  const cachePath = path.join(dir, 'feed.json');
  const result = await readRawFeedCache(cachePath);
  assert.equal(result, null);
});

test('readRawFeedCache parses existing cache', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-raw-'));
  const cachePath = path.join(dir, 'feed.json');
  const cache: RawCachedFeed = {
    title: 'Title',
    description: 'Desc',
    url: 'https://example.com/feed.xml',
    items: [{ title: 't', description: 'd', link: 'https://example.com/a', timestamp: '2024' }],
  };
  await writeFile(cachePath, JSON.stringify(cache), 'utf8');

  const result = await readRawFeedCache(cachePath);
  assert.deepEqual(result, cache);
});

test('readRawFeedCache returns null for invalid cache content', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-raw-'));
  const cachePath = path.join(dir, 'feed.json');
  await writeFile(cachePath, JSON.stringify({ broken: true }), 'utf8');

  const result = await readRawFeedCache(cachePath);
  assert.equal(result, null);
});

test('readRawFeedCache rejects source-only fields', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-cache-read-raw-'));
  const cachePath = path.join(dir, 'feed.json');
  await writeFile(
    cachePath,
    JSON.stringify({
      title: 'Title',
      description: 'Desc',
      url: 'https://example.com/feed.xml',
      items: [],
      omittedLinks: ['https://example.com/a'],
    }),
    'utf8',
  );

  const result = await readRawFeedCache(cachePath);
  assert.equal(result, null);
});

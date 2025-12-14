import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { buildSource } from './build-source.ts';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { writeFeedCache } from './write-feed-cache.ts';

async function setupSource(directory: string, filename = 'source.yaml') {
  const sourcePath = path.join(directory, filename);
  await writeFile(
    sourcePath,
    [
      'name: Example Source',
      'description: Demo source',
      'link: https://example.com',
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
    'utf8',
  );
  return sourcePath;
}

test('buildSource returns RSS XML from cache', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-build-source-'));
  const cacheRoot = path.join(tempDir, 'cache');
  const sourcePath = await setupSource(tempDir);

  const cachePath = getFeedCachePath(cacheRoot, 'https://example.com/feed.xml');
  await writeFeedCache(cachePath, {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'Older',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
      {
        title: 'Newer',
        description: null,
        link: 'https://example.com/b',
        timestamp: '2024-04-02T00:00:00.000Z',
      },
    ],
  });

  const xml = await buildSource({ cacheRoot, sourcePath });
  assert.ok(xml.includes('<rss'));
  assert.ok(xml.includes('Example Source'));

  const indexA = xml.indexOf('https://example.com/a');
  const indexB = xml.indexOf('https://example.com/b');
  assert.ok(indexB >= 0);
  assert.ok(indexA >= 0);
  assert.ok(indexB < indexA);
});

test('buildSource throws when cache is missing', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-build-source-'));
  const cacheRoot = path.join(tempDir, 'cache');
  const sourcePath = await setupSource(tempDir);
  await assert.rejects(buildSource({ cacheRoot, sourcePath }), /Missing cache/);
});

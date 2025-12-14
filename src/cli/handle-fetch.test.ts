import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { handleFetch } from './handle-fetch.ts';
import { getFeedCachePath } from '../core/get-feed-cache-path.ts';
import { getSourceFeedCachePath } from '../core/get-source-feed-cache-path.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';

const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Feed</title>
    <item>
      <title>Item</title>
      <link>https://example.com/a</link>
      <pubDate>Mon, 01 Apr 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

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

test('handleFetch prints help when requested', async () => {
  const logMock = mock.method(console, 'log', () => {});
  await handleFetch(['--help']);
  assert.equal(logMock.mock.callCount(), 1);
  logMock.mock.restore();
});

test('handleFetch fetches default source and writes cache', async () => {
  const cwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-handle-fetch-'));
  const cacheDir = path.join(tempDir, 'cache');
  const sourcePath = await setupSource(tempDir);

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => sampleRss,
  }));
  const logMock = mock.method(console, 'log', () => {});

  process.chdir(tempDir);
  await handleFetch([sourcePath, '--cache-dir', cacheDir]);
  process.chdir(cwd);

  const cachePath = getFeedCachePath(cacheDir, 'https://example.com/feed.xml');
  const cacheContent = JSON.parse(await readFile(cachePath, 'utf8'));
  const sourceHash = await hashSourcePath(sourcePath);
  const processedCachePath = getSourceFeedCachePath(
    cacheDir,
    sourceHash,
    'https://example.com/feed.xml',
  );
  const processedContent = JSON.parse(await readFile(processedCachePath, 'utf8'));

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(cacheContent.items.length, 1);
  assert.equal(cacheContent.title, 'Feed');
  assert.equal(processedContent.items.length, 1);
  assert.equal(processedContent.items[0].link, 'https://example.com/a');
  assert.ok(logMock.mock.calls[0]?.arguments[0].includes('Fetched 1 feeds (1 items)'));

  fetchMock.mock.restore();
  logMock.mock.restore();
});

test('handleFetch uses custom source path', async () => {
  const cwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-handle-fetch-'));
  const cacheDir = path.join(tempDir, 'cache');
  await setupSource(tempDir, 'custom.yaml');

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => sampleRss,
  }));
  const logMock = mock.method(console, 'log', () => {});

  process.chdir(tempDir);
  await handleFetch(['custom.yaml', '--cache-dir', cacheDir]);
  process.chdir(cwd);

  const cachePath = getFeedCachePath(cacheDir, 'https://example.com/feed.xml');
  const cacheContent = JSON.parse(await readFile(cachePath, 'utf8'));
  const sourceHash = await hashSourcePath(path.join(tempDir, 'custom.yaml'));
  const processedCachePath = getSourceFeedCachePath(
    cacheDir,
    sourceHash,
    'https://example.com/feed.xml',
  );
  const processedContent = JSON.parse(await readFile(processedCachePath, 'utf8'));

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(cacheContent.items[0].link, 'https://example.com/a');
  assert.equal(processedContent.items[0].link, 'https://example.com/a');
  assert.ok(logMock.mock.calls[0]?.arguments[0].includes('Fetched 1 feeds (1 items)'));

  fetchMock.mock.restore();
  logMock.mock.restore();
});

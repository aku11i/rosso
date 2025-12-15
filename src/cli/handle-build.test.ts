import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { handleBuild } from './handle-build.ts';
import { getSourceFeedCachePath } from '../core/get-source-feed-cache-path.ts';
import { writeSourceFeedCache } from '../core/write-source-feed-cache.ts';
import { hashSourcePath } from '../utils/hash-source-path.ts';

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

test('handleBuild prints help when requested', async () => {
  const logMock = mock.method(console, 'log', () => {});
  await handleBuild(['--help']);
  assert.equal(logMock.mock.callCount(), 1);
  logMock.mock.restore();
});

test('handleBuild outputs RSS to stdout by default', async () => {
  const cwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-handle-build-'));
  const cacheDir = path.join(tempDir, 'cache');
  const sourcePath = await setupSource(tempDir);

  const sourceHash = await hashSourcePath(sourcePath);
  const processedCachePath = getSourceFeedCachePath(
    cacheDir,
    sourceHash,
    'https://example.com/feed.xml',
  );
  await writeSourceFeedCache(processedCachePath, {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'Item',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  });

  const logMock = mock.method(console, 'log', () => {});

  process.chdir(tempDir);
  await handleBuild([sourcePath, '--cache-dir', cacheDir]);
  process.chdir(cwd);

  assert.equal(logMock.mock.callCount(), 1);
  assert.ok(String(logMock.mock.calls[0]?.arguments[0]).includes('<rss'));
  assert.ok(String(logMock.mock.calls[0]?.arguments[0]).includes('Example Source'));

  logMock.mock.restore();
});

test('handleBuild writes RSS to file when requested', async () => {
  const cwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-handle-build-'));
  const cacheDir = path.join(tempDir, 'cache');
  const sourcePath = await setupSource(tempDir);

  const sourceHash = await hashSourcePath(sourcePath);
  const processedCachePath = getSourceFeedCachePath(
    cacheDir,
    sourceHash,
    'https://example.com/feed.xml',
  );
  await writeSourceFeedCache(processedCachePath, {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'Item',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  });

  const outputPath = path.join(tempDir, 'out', 'feed.xml');
  const logMock = mock.method(console, 'log', () => {});

  process.chdir(tempDir);
  await handleBuild([sourcePath, '--cache-dir', cacheDir, '--output-file', outputPath]);
  process.chdir(cwd);

  assert.equal(logMock.mock.callCount(), 0);

  const xml = await readFile(outputPath, 'utf8');
  assert.ok(xml.includes('<rss'));
  assert.ok(xml.includes('Example Source'));

  logMock.mock.restore();
});

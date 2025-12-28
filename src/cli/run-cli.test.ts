import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { runCli } from './run-cli.ts';
import { getFeedCachePath } from '../core/get-feed-cache-path.ts';

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

async function writeSourceFile(directory: string) {
  const sourcePath = path.join(directory, 'source.yaml');
  await writeFile(
    sourcePath,
    [
      'sourceId: example-source',
      'name: Example Source',
      'description: Demo source',
      'link: https://example.com',
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
    'utf8',
  );
}

test('runCli shows help when no command', async () => {
  const logMock = mock.method(console, 'log', () => {});
  await runCli([]);
  assert.ok(logMock.mock.calls[0]?.arguments[0].includes('Usage: rosso'));
  logMock.mock.restore();
});

test('runCli runs fetch command end-to-end', async () => {
  const cwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-run-cli-'));
  const cacheDir = path.join(tempDir, 'cache');
  await writeSourceFile(tempDir);

  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => sampleRss,
  }));
  const logMock = mock.method(console, 'log', () => {});

  process.chdir(tempDir);
  await runCli(['fetch', 'source.yaml', '--cache-dir', cacheDir]);
  process.chdir(cwd);

  const cachePath = getFeedCachePath(cacheDir, 'https://example.com/feed.xml');
  const cacheContent = JSON.parse(await readFile(cachePath, 'utf8'));

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(cacheContent.items[0].title, 'Item');

  fetchMock.mock.restore();
  logMock.mock.restore();
});

test('runCli sets exit code for unknown command', async () => {
  const errorMock = mock.method(console, 'error', () => {});
  const logMock = mock.method(console, 'log', () => {});
  await runCli(['unknown']);
  assert.equal(process.exitCode, 1);
  process.exitCode = undefined;
  errorMock.mock.restore();
  logMock.mock.restore();
});

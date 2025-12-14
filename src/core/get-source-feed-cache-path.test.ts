import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';

test('getSourceFeedCachePath uses source hash + hashed feed url', () => {
  const sourceHash = 'abc123';
  const feedHash = hashFeedUrl('https://example.com/feed.xml');
  const targetPath = getSourceFeedCachePath(
    '/tmp/cache',
    sourceHash,
    'https://example.com/feed.xml',
  );
  assert.equal(
    targetPath,
    path.join('/tmp/cache', 'sources', sourceHash, 'feeds', `${feedHash}.json`),
  );
});

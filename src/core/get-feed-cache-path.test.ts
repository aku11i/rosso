import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getFeedCachePath } from './get-feed-cache-path.ts';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';

test('getFeedCachePath uses hashed feed url', () => {
  const hash = hashFeedUrl('https://example.com/feed.xml');
  const targetPath = getFeedCachePath('/tmp/cache', 'https://example.com/feed.xml');
  assert.equal(targetPath, path.join('/tmp/cache', `${hash}.json`));
});

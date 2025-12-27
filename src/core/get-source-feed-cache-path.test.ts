import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getSourceFeedCachePath } from './get-source-feed-cache-path.ts';
import { hashFeedUrl } from '../utils/hash-feed-url.ts';
import { hashSourceId } from '../utils/hash-source-id.ts';

test('getSourceFeedCachePath uses hashed source id + hashed feed url', () => {
  const sourceId = 'source-id';
  const sourceHash = hashSourceId(sourceId);
  const feedHash = hashFeedUrl('https://example.com/feed.xml');
  const targetPath = getSourceFeedCachePath('/tmp/cache', sourceId, 'https://example.com/feed.xml');
  assert.equal(
    targetPath,
    path.join('/tmp/cache', 'sources', sourceHash, 'feeds', `${feedHash}.json`),
  );
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { getUniqueFeedUrls } from './get-unique-feed-urls.ts';

test('getUniqueFeedUrls dedupes while keeping first-seen order', () => {
  const urls = getUniqueFeedUrls([
    { type: 'rss', url: 'https://example.com/a.xml' },
    { type: 'rss', url: 'https://example.com/a.xml' },
    { type: 'rss', url: 'https://example.com/b.xml' },
    { type: 'rss', url: 'https://example.com/a.xml' },
  ]);

  assert.deepEqual(urls, ['https://example.com/a.xml', 'https://example.com/b.xml']);
});

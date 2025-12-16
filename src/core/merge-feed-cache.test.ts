import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeFeedCache } from './merge-feed-cache.ts';
import type { RawCachedFeed } from '../schema.ts';

test('mergeFeedCache keeps existing item timestamps and updates other fields', () => {
  const previous: RawCachedFeed = {
    title: 'Old title',
    description: 'old desc',
    url: 'https://example.com/feed.xml',
    items: [
      { title: 'A', description: null, link: 'a', timestamp: 'old' },
      { title: 'B', description: null, link: 'b', timestamp: 'old' },
    ],
  };

  const fetched: RawCachedFeed = {
    title: 'New title',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      { title: 'A2', description: 'new', link: 'a', timestamp: 'new' },
      { title: 'C', description: null, link: 'c', timestamp: 'new' },
    ],
  };

  const merged = mergeFeedCache(previous, fetched);

  assert.equal(merged.title, 'New title');
  assert.equal(merged.description, 'old desc');
  assert.equal(merged.items.length, 3);
  const links = merged.items.map((item) => item.link);
  assert.deepEqual(links.sort(), ['a', 'b', 'c'].sort());
  assert.equal(merged.items.find((item) => item.link === 'a')?.title, 'A2');
  assert.equal(merged.items.find((item) => item.link === 'a')?.description, 'new');
  assert.equal(merged.items.find((item) => item.link === 'a')?.timestamp, 'old');
});

test('mergeFeedCache handles missing previous cache', () => {
  const fetched: RawCachedFeed = {
    title: 'Title',
    description: 'desc',
    url: 'https://example.com/feed.xml',
    items: [{ title: 'A', description: null, link: 'a', timestamp: 'new' }],
  };

  const merged = mergeFeedCache(null, fetched);
  assert.equal(merged.items.length, 1);
  assert.equal(merged.title, 'Title');
});

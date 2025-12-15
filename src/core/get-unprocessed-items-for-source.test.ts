import assert from 'node:assert/strict';
import test from 'node:test';
import { getUnprocessedItemsForSource } from './get-unprocessed-items-for-source.ts';
import type { RawCachedFeed, SourceCachedFeed } from '../schema.ts';

function item(link: string) {
  return { title: null, description: null, link, timestamp: '2024-01-01T00:00:00.000Z' };
}

test('getUnprocessedItemsForSource returns all items when there is no previous cache', () => {
  const mergedFeed: RawCachedFeed = {
    title: null,
    description: null,
    url: 'https://example.com/feed.xml',
    items: [item('https://example.com/a'), item('https://example.com/b')],
  };

  const { unprocessedItems, keptLinks, omittedLinks } = getUnprocessedItemsForSource({
    mergedFeed,
    previousProcessed: null,
  });

  assert.deepEqual(
    unprocessedItems.map((i) => i.link),
    ['https://example.com/a', 'https://example.com/b'],
  );
  assert.deepEqual(Array.from(keptLinks), []);
  assert.deepEqual(Array.from(omittedLinks), []);
});

test('getUnprocessedItemsForSource excludes previously kept and omitted items', () => {
  const mergedFeed: RawCachedFeed = {
    title: null,
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      item('https://example.com/a'),
      item('https://example.com/b'),
      item('https://example.com/c'),
    ],
  };

  const previousProcessed: SourceCachedFeed = {
    title: null,
    description: null,
    url: mergedFeed.url,
    items: [item('https://example.com/a')],
    omittedLinks: ['https://example.com/b'],
  };

  const { unprocessedItems, keptLinks, omittedLinks } = getUnprocessedItemsForSource({
    mergedFeed,
    previousProcessed,
  });

  assert.deepEqual(
    unprocessedItems.map((i) => i.link),
    ['https://example.com/c'],
  );
  assert.deepEqual(Array.from(keptLinks), ['https://example.com/a']);
  assert.deepEqual(Array.from(omittedLinks), ['https://example.com/b']);
});

test('getUnprocessedItemsForSource handles missing omittedLinks', () => {
  const mergedFeed: RawCachedFeed = {
    title: null,
    description: null,
    url: 'https://example.com/feed.xml',
    items: [item('https://example.com/a'), item('https://example.com/b')],
  };

  const previousProcessed: SourceCachedFeed = {
    title: null,
    description: null,
    url: mergedFeed.url,
    items: [item('https://example.com/a')],
  };

  const { unprocessedItems, keptLinks, omittedLinks } = getUnprocessedItemsForSource({
    mergedFeed,
    previousProcessed,
  });

  assert.deepEqual(
    unprocessedItems.map((i) => i.link),
    ['https://example.com/b'],
  );
  assert.deepEqual(Array.from(keptLinks), ['https://example.com/a']);
  assert.deepEqual(Array.from(omittedLinks), []);
});

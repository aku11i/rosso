import assert from 'node:assert/strict';
import test from 'node:test';
import { filterFeedItemsWithLlm } from './filter-feed-items-with-llm.ts';
import type { CachedItem } from '../schema.ts';

function createItems(count: number): CachedItem[] {
  const items: CachedItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      title: `Title ${i}`,
      description: `Description ${i}`,
      link: `https://example.com/${i}`,
      timestamp: '2024-04-01T00:00:00.000Z',
    });
  }
  return items;
}

test('filterFeedItemsWithLlm splits items into chunks of 10', async () => {
  const items = createItems(25);
  let callCount = 0;

  const generateObjectFn = async () => {
    callCount++;
    const selected = items[(callCount - 1) * 10]?.link;
    assert.ok(selected, 'expected selected link');

    return { object: { links: [selected, 'https://not-in-chunk.example.com'] } };
  };

  const result = await filterFeedItemsWithLlm({
    model: {} as never,
    filter: 'Keep everything',
    feedUrl: 'https://example.com/feed.xml',
    items,
    generateObjectFn: generateObjectFn as never,
  });

  assert.equal(callCount, 3);
  assert.deepEqual(
    result.map((item) => item.link),
    ['https://example.com/0', 'https://example.com/10', 'https://example.com/20'],
  );
});

test('filterFeedItemsWithLlm returns empty array for empty input', async () => {
  let called = false;
  const generateObjectFn = async () => {
    called = true;
    return { object: { links: [] } };
  };

  const result = await filterFeedItemsWithLlm({
    model: {} as never,
    filter: 'Keep everything',
    feedUrl: 'https://example.com/feed.xml',
    items: [],
    generateObjectFn: generateObjectFn as never,
  });

  assert.equal(called, false);
  assert.deepEqual(result, []);
});

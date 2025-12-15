import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
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

let generateObjectHandler = async (..._args: unknown[]) => ({ object: { links: [] } });

mock.module('ai', {
  namedExports: {
    generateObject: async (...args: unknown[]) => generateObjectHandler(...args),
  },
});

let filterFeedItemsWithLlm: typeof import('./filter-feed-items-with-llm.ts').filterFeedItemsWithLlm;

test.before(async () => {
  ({ filterFeedItemsWithLlm } = await import('./filter-feed-items-with-llm.ts'));
});

test('filterFeedItemsWithLlm splits items into chunks of 10', async () => {
  const items = createItems(25);
  let callCount = 0;

  generateObjectHandler = async (options: unknown) => {
    callCount++;
    assert.equal(typeof options, 'object');
    assert.ok(options);
    const system = (options as { system?: unknown }).system;
    if (typeof system !== 'string') {
      throw new Error('expected system prompt string');
    }
    assert.ok(system.includes('<system>'));
    assert.ok(system.includes('<rules>'));

    const selected = items[(callCount - 1) * 10]?.link;
    assert.ok(selected, 'expected selected link');
    return { object: { links: [selected, 'https://not-in-chunk.example.com'] } } as never;
  };

  const result = await filterFeedItemsWithLlm({
    model: {} as never,
    filter: 'Keep everything',
    feedUrl: 'https://example.com/feed.xml',
    items,
  });

  assert.equal(callCount, 3);
  assert.deepEqual(
    result.map((item) => item.link),
    ['https://example.com/0', 'https://example.com/10', 'https://example.com/20'],
  );
});

test('filterFeedItemsWithLlm returns empty array for empty input', async () => {
  let called = false;

  generateObjectHandler = async () => {
    called = true;
    return { object: { links: [] } } as never;
  };

  const result = await filterFeedItemsWithLlm({
    model: {} as never,
    filter: 'Keep everything',
    feedUrl: 'https://example.com/feed.xml',
    items: [],
  });

  assert.equal(called, false);
  assert.deepEqual(result, []);
});

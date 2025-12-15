import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import type { CachedFeed } from '../schema.ts';

let generateObjectHandler = async (..._args: unknown[]) => ({ object: { links: [] } });

mock.module('ai', {
  namedExports: {
    generateObject: async (...args: unknown[]) => generateObjectHandler(...args),
  },
});

let processFeedForSource: typeof import('./process-feed-for-source.ts').processFeedForSource;

test.before(async () => {
  ({ processFeedForSource } = await import('./process-feed-for-source.ts'));
});

test('processFeedForSource returns feed unchanged when no filter is provided', async () => {
  const feed: CachedFeed = {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'A',
        description: null,
        link: 'https://example.com/a',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  };

  const result = await processFeedForSource({
    sourcePath: '/tmp/source.yaml',
    feedUrl: feed.url,
    feed,
  });

  assert.deepEqual(result, feed);
});

test('processFeedForSource throws when filter exists without model config', async () => {
  const feed: CachedFeed = {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [],
  };

  await assert.rejects(
    processFeedForSource({
      sourcePath: '/tmp/source.yaml',
      feedUrl: feed.url,
      feed,
      filter: 'Only keep relevant items',
    }),
  );
});

test('processFeedForSource filters items using generateObject', async () => {
  generateObjectHandler = async () =>
    ({ object: { links: ['https://example.com/keep'] } }) as never;

  const feed: CachedFeed = {
    title: 'Feed',
    description: null,
    url: 'https://example.com/feed.xml',
    items: [
      {
        title: 'Keep',
        description: null,
        link: 'https://example.com/keep',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
      {
        title: 'Drop',
        description: null,
        link: 'https://example.com/drop',
        timestamp: '2024-04-01T00:00:00.000Z',
      },
    ],
  };

  const result = await processFeedForSource({
    sourcePath: '/tmp/source.yaml',
    feedUrl: feed.url,
    feed,
    filter: 'Keep only items with title "Keep"',
    model: { provider: 'openai', model: 'gpt-5-mini', apiKey: 'test' },
  });

  assert.deepEqual(
    result.items.map((item) => item.link),
    ['https://example.com/keep'],
  );
});

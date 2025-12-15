import assert from 'node:assert/strict';
import test from 'node:test';
import { processFeedForSource } from './process-feed-for-source.ts';
import type { CachedFeed } from '../schema.ts';

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

  const generateObjectFn = async () => ({ object: { links: ['https://example.com/keep'] } });

  const result = await processFeedForSource({
    sourcePath: '/tmp/source.yaml',
    feedUrl: feed.url,
    feed,
    filter: 'Keep only items with title "Keep"',
    model: { provider: 'openai', model: 'gpt-5-mini', apiKey: 'test' },
    generateObjectFn: generateObjectFn as never,
  });

  assert.deepEqual(
    result.items.map((item) => item.link),
    ['https://example.com/keep'],
  );
});

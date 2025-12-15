import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import type { RawCachedFeed } from '../schema.ts';

let generateObjectHandler = async (..._args: unknown[]) => ({ object: { links: [] } });
let createOpenAICalls: Array<{ apiKey?: string; baseURL?: string }> = [];
let lastModelType: 'default' | 'chat' | undefined;

mock.module('ai', {
  namedExports: {
    generateObject: async (...args: unknown[]) => generateObjectHandler(...args),
  },
});

mock.module('@ai-sdk/openai', {
  namedExports: {
    createOpenAI: (options: { apiKey?: string; baseURL?: string }) => {
      createOpenAICalls.push(options);

      const provider = ((..._args: unknown[]) => {
        lastModelType = 'default';
        return {} as never;
      }) as unknown as {
        (...args: unknown[]): unknown;
        chat: (...args: unknown[]) => unknown;
      };

      provider.chat = (..._args: unknown[]) => {
        lastModelType = 'chat';
        return {} as never;
      };

      return provider;
    },
  },
});

let processFeedForSource: typeof import('./process-feed-for-source.ts').processFeedForSource;

test.before(async () => {
  ({ processFeedForSource } = await import('./process-feed-for-source.ts'));
});

test.beforeEach(() => {
  createOpenAICalls = [];
  lastModelType = undefined;
});

test('processFeedForSource returns feed unchanged when no filter is provided', async () => {
  const feed: RawCachedFeed = {
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
  const feed: RawCachedFeed = {
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
      filter: { prompt: 'Only keep relevant items' },
    }),
  );
});

test('processFeedForSource filters items using generateObject', async () => {
  generateObjectHandler = async () =>
    ({ object: { links: ['https://example.com/keep'] } }) as never;

  const feed: RawCachedFeed = {
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
    filter: { prompt: 'Keep only items with title "Keep"' },
    model: { provider: 'openai', model: 'gpt-5-mini', apiKey: 'test' },
  });

  assert.deepEqual(
    result.items.map((item) => item.link),
    ['https://example.com/keep'],
  );
});

test('processFeedForSource uses chat/completions for github provider', async () => {
  generateObjectHandler = async () =>
    ({ object: { links: ['https://example.com/keep'] } }) as never;

  const feed: RawCachedFeed = {
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
    ],
  };

  await processFeedForSource({
    sourcePath: '/tmp/source.yaml',
    feedUrl: feed.url,
    feed,
    filter: { prompt: 'Keep only items with title "Keep"' },
    model: { provider: 'github', model: 'gpt-5-mini', apiKey: 'test' },
  });

  assert.equal(lastModelType, 'chat');
  assert.equal(createOpenAICalls.length, 1);
  assert.equal(createOpenAICalls[0]?.baseURL, 'https://models.github.ai/inference');
  assert.equal(createOpenAICalls[0]?.apiKey, 'test');
});

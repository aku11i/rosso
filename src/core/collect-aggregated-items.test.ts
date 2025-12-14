import assert from 'node:assert/strict';
import test from 'node:test';
import { collectAggregatedItems } from './collect-aggregated-items.ts';

test('collectAggregatedItems keeps duplicate links across different feeds', () => {
  const items = collectAggregatedItems(
    [
      {
        title: null,
        description: null,
        url: 'https://example.com/feed-1.xml',
        items: [
          {
            title: 'From 1',
            description: null,
            link: 'https://example.com/item',
            timestamp: '2024-04-02T00:00:00.000Z',
          },
        ],
      },
      {
        title: null,
        description: null,
        url: 'https://example.com/feed-2.xml',
        items: [
          {
            title: 'From 2',
            description: null,
            link: 'https://example.com/item',
            timestamp: '2024-04-01T00:00:00.000Z',
          },
        ],
      },
    ],
    'source.yaml',
  );

  assert.equal(items.length, 2);
  assert.equal(items[0]?.title, 'From 1');
  assert.equal(items[1]?.title, 'From 2');
});

test('collectAggregatedItems throws on invalid timestamps', () => {
  assert.throws(
    () =>
      collectAggregatedItems(
        [
          {
            title: null,
            description: null,
            url: 'https://example.com/feed.xml',
            items: [
              {
                title: 'Item',
                description: null,
                link: 'https://example.com/a',
                timestamp: 'not-a-date',
              },
            ],
          },
        ],
        'source.yaml',
      ),
    /Invalid timestamp in cache/,
  );
});


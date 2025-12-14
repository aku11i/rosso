import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { fetchFeed } from './fetch-feed.ts';

const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <description>Feed description</description>
    <item>
      <title>First</title>
      <link>https://example.com/a</link>
      <description>desc</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Duplicate</title>
      <link>https://example.com/a</link>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second</title>
      <link>https://example.com/b</link>
    </item>
    <item>
      <title>Missing link</title>
    </item>
  </channel>
</rss>`;

test('fetchFeed filters duplicates and missing links', async () => {
  const fetchTimestamp = '2024-02-01T00:00:00.000Z';
  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => sampleRss,
  }));

  const result = await fetchFeed('https://example.com/feed', fetchTimestamp);

  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(result.title, 'Test Feed');
  assert.equal(result.description, 'Feed description');
  assert.equal(result.items.length, 2);
  const [first, second] = result.items;
  assert.equal(first.link, 'https://example.com/a');
  assert.equal(first.timestamp, '2024-01-01T00:00:00.000Z');
  assert.equal(second.link, 'https://example.com/b');
  assert.equal(second.timestamp, fetchTimestamp);

  fetchMock.mock.restore();
});

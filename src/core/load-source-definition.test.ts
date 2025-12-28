import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadSourceDefinition } from './load-source-definition.ts';

async function createSourceFile(contents: string) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rosso-source-'));
  const filePath = path.join(dir, 'source.yaml');
  await writeFile(filePath, contents, 'utf8');
  return filePath;
}

test('loadSourceDefinition parses valid source file', async () => {
  const filePath = await createSourceFile(
    [
      'sourceId: example-source',
      'name: Example',
      'description: Demo source',
      'link: https://example.com',
      'feeds:',
      '  - type: rss',
      '    url: https://example.com/feed.xml',
    ].join('\n'),
  );

  const source = await loadSourceDefinition(filePath);
  assert.equal(source.sourceId, 'example-source');
  assert.equal(source.name, 'Example');
  assert.equal(source.description, 'Demo source');
  assert.equal(source.link, 'https://example.com');
  assert.deepEqual(source.feeds, [{ type: 'rss', url: 'https://example.com/feed.xml' }]);
});

test('loadSourceDefinition rejects missing required fields', async () => {
  const filePath = await createSourceFile('description: nope');
  await assert.rejects(loadSourceDefinition(filePath));
});

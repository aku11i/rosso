import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getCacheFilePath } from './get-cache-file-path.ts';

test('getCacheFilePath slugs source name', () => {
  const targetPath = getCacheFilePath('/tmp/cache', 'My Source!');
  assert.equal(targetPath, path.join('/tmp/cache', 'my-source.json'));
});

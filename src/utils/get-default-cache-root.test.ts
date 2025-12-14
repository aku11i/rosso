import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getDefaultCacheRoot } from './get-default-cache-root.ts';

test('getDefaultCacheRoot returns a usable cache path', () => {
  const cacheRoot = getDefaultCacheRoot();
  assert.equal(typeof cacheRoot, 'string');
  assert.ok(cacheRoot.length > 0);
  assert.ok(path.isAbsolute(cacheRoot));
});

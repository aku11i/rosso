import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { getDefaultCacheDir } from './get-default-cache-dir.ts';

test('getDefaultCacheDir returns a usable cache path', () => {
  const cacheDir = getDefaultCacheDir();
  assert.equal(typeof cacheDir, 'string');
  assert.ok(cacheDir.length > 0);
  assert.ok(path.isAbsolute(cacheDir));
});

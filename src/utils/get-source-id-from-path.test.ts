import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { getSourceIdFromPath } from './get-source-id-from-path.ts';

test('getSourceIdFromPath returns the realpath of the source file', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-source-id-'));
  const sourcePath = path.join(tempDir, 'source.yaml');
  await writeFile(sourcePath, 'name: Example\n', 'utf8');

  const expected = await realpath(sourcePath);
  const actual = await getSourceIdFromPath(sourcePath);
  assert.equal(actual, expected);
});

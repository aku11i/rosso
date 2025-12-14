import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import { mkdtemp, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { hashSourcePath } from './hash-source-path.ts';

test('hashSourcePath uses realpath for hashing', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'rosso-hash-source-path-'));
  const sourcePath = path.join(tempDir, 'source.yaml');
  await writeFile(sourcePath, 'name: Example\n', 'utf8');

  const resolved = await realpath(sourcePath);
  const expected = crypto.createHash('sha256').update(resolved).digest('hex');

  const actual = await hashSourcePath(sourcePath);
  assert.equal(actual, expected);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchSource } from './index.ts';

test('index exports fetchSource function', () => {
  assert.equal(typeof fetchSource, 'function');
});

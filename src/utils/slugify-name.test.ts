import assert from 'node:assert/strict';
import test from 'node:test';
import { slugifyName } from './slugify-name.ts';

test('slugifyName converts text to dashed lowercase', () => {
  assert.equal(slugifyName('My Source Name'), 'my-source-name');
});

test('slugifyName collapses symbols and trims', () => {
  assert.equal(slugifyName('  Hello!! World??  '), 'hello-world');
});

test('slugifyName throws for empty input', () => {
  assert.throws(() => slugifyName('***'));
});

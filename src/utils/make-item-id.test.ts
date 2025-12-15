import assert from 'node:assert/strict';
import test from 'node:test';
import { makeItemId } from './make-item-id.ts';

test('makeItemId returns a stable, newline-free ID', () => {
  const id = makeItemId('https://example.com/feed.xml', 'https://example.com/item');
  assert.ok(!id.includes('\n'));
  assert.equal(id, 'YYMBqtkNjrkp2r5mEmuemrmtR1Ce-eqWWvStS6bJtIw');
});

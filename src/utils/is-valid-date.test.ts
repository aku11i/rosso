import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidDate } from './is-valid-date.ts';

test('isValidDate returns true for valid dates', () => {
  assert.equal(isValidDate(new Date('2024-04-01T00:00:00.000Z')), true);
});

test('isValidDate returns false for invalid dates', () => {
  assert.equal(isValidDate(new Date('not-a-date')), false);
});


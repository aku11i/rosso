import crypto from 'node:crypto';

export function hashSourceId(sourceId: string) {
  return crypto.createHash('sha256').update(sourceId).digest('hex');
}

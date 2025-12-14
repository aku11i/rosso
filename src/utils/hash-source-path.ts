import crypto from 'node:crypto';
import { realpath } from 'node:fs/promises';

export async function hashSourcePath(sourcePath: string) {
  const resolved = await realpath(sourcePath);
  return crypto.createHash('sha256').update(resolved).digest('hex');
}

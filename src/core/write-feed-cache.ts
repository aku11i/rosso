import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CachedFeed } from '../schema.ts';

export async function writeFeedCache(cachePath: string, cache: CachedFeed) {
  await mkdir(path.dirname(cachePath), { recursive: true });
  const content = JSON.stringify(cache, null, 2);
  await writeFile(cachePath, `${content}\n`, 'utf8');
}

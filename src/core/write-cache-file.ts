import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SourceCache } from '../types.ts';

export async function writeCacheFile(cachePath: string, cache: SourceCache) {
  await mkdir(path.dirname(cachePath), { recursive: true });
  const content = JSON.stringify(cache, null, 2);
  await writeFile(cachePath, `${content}\n`, 'utf8');
}

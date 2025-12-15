import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function writeCacheFile(cachePath: string, cache: unknown) {
  await mkdir(path.dirname(cachePath), { recursive: true });
  const content = JSON.stringify(cache, null, 2);
  await writeFile(cachePath, `${content}\n`, 'utf8');
}

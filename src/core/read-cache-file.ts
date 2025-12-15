import { readFile } from 'node:fs/promises';

export async function readCacheFile(cachePath: string): Promise<unknown | null> {
  try {
    const content = await readFile(cachePath, 'utf8');
    return JSON.parse(content) as unknown;
  } catch (error) {
    const code = error && typeof error === 'object' ? (error as { code?: string }).code : null;
    if (code === 'ENOENT') {
      return null;
    }
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to read cache file ${cachePath}: ${message}`);
  }
}

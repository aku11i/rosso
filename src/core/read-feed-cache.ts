import { readFile, stat } from 'node:fs/promises';
import type { CachedFeed } from '../types.ts';

export async function readFeedCache(cachePath: string): Promise<CachedFeed | null> {
  try {
    await stat(cachePath);
  } catch (error) {
    const code = error && typeof error === 'object' ? (error as { code?: string }).code : null;
    if (code === 'ENOENT') {
      return null;
    }
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to access cache file ${cachePath}: ${message}`);
  }

  try {
    const content = await readFile(cachePath, 'utf8');
    return JSON.parse(content) as CachedFeed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to read cache file ${cachePath}: ${message}`);
  }
}

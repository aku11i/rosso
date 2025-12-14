import { readFile } from 'node:fs/promises';
import { cachedFeedSchema, type CachedFeed } from '../schema.ts';

export async function readFeedCache(cachePath: string): Promise<CachedFeed | null> {
  try {
    const content = await readFile(cachePath, 'utf8');
    const parsedJson = JSON.parse(content);
    const result = cachedFeedSchema.safeParse(parsedJson);
    if (!result.success) {
      return null;
    }
    return result.data;
  } catch (error) {
    const code = error && typeof error === 'object' ? (error as { code?: string }).code : null;
    if (code === 'ENOENT') {
      return null;
    }
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to read cache file ${cachePath}: ${message}`);
  }
}

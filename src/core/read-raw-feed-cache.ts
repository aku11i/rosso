import type { RawCachedFeed } from '../schema.ts';
import { rawCachedFeedSchema } from '../schema.ts';
import { readCacheFile } from './read-cache-file.ts';

export async function readRawFeedCache(cachePath: string): Promise<RawCachedFeed | null> {
  const parsedJson = await readCacheFile(cachePath);
  if (!parsedJson) {
    return null;
  }

  const result = rawCachedFeedSchema.safeParse(parsedJson);
  if (!result.success) {
    return null;
  }
  return result.data;
}

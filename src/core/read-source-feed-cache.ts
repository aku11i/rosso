import type { SourceCachedFeed } from '../schema.ts';
import { sourceCachedFeedSchema } from '../schema.ts';
import { readCacheFile } from './read-cache-file.ts';

export async function readSourceFeedCache(cachePath: string): Promise<SourceCachedFeed | null> {
  const parsedJson = await readCacheFile(cachePath);
  if (!parsedJson) {
    return null;
  }

  const result = sourceCachedFeedSchema.safeParse(parsedJson);
  if (!result.success) {
    return null;
  }
  return result.data;
}

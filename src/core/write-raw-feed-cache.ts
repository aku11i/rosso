import type { RawCachedFeed } from '../schema.ts';
import { writeCacheFile } from './write-cache-file.ts';

export async function writeRawFeedCache(cachePath: string, cache: RawCachedFeed) {
  await writeCacheFile(cachePath, cache);
}

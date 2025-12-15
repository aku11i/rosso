import type { SourceCachedFeed } from '../schema.ts';
import { writeCacheFile } from './write-cache-file.ts';

export async function writeSourceFeedCache(cachePath: string, cache: SourceCachedFeed) {
  await writeCacheFile(cachePath, cache);
}

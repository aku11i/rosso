import path from 'node:path';
import { slugifyName } from '../utils/slugify-name.ts';

export function getCacheFilePath(cacheDir: string, sourceName: string) {
  return path.join(cacheDir, `${slugifyName(sourceName)}.json`);
}

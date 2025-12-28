import { realpath } from 'node:fs/promises';

export async function getSourceIdFromPath(sourcePath: string) {
  return realpath(sourcePath);
}

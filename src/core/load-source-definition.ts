import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import type { FeedEntry, SourceDefinition } from '../types.ts';

export async function loadSourceDefinition(sourcePath: string): Promise<SourceDefinition> {
  const yamlText = await readFile(sourcePath, 'utf8');

  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlText);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to parse ${sourcePath}: ${message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Source file ${sourcePath} must contain a YAML object`);
  }

  const candidate = parsed as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const description =
    typeof candidate.description === 'string' ? candidate.description.trim() : '';
  const link = typeof candidate.link === 'string' ? candidate.link.trim() : '';

  if (!name) {
    throw new Error(`Source file ${sourcePath} is missing "name"`);
  }
  if (!description) {
    throw new Error(`Source file ${sourcePath} is missing "description"`);
  }
  if (!link) {
    throw new Error(`Source file ${sourcePath} is missing "link"`);
  }

  if (!Array.isArray(candidate.feeds)) {
    throw new Error(`Source file ${sourcePath} must contain a "feeds" array`);
  }

  const normalizedFeeds: FeedEntry[] = [];
  for (const feed of candidate.feeds) {
    if (!feed || typeof feed !== 'object') {
      throw new Error(`Source file ${sourcePath} has an invalid feed entry`);
    }
    const entry = feed as Record<string, unknown>;
    const type = entry.type === 'rss' ? 'rss' : null;
    const url = typeof entry.url === 'string' ? entry.url.trim() : '';

    if (type !== 'rss') {
      throw new Error(`Source file ${sourcePath} only supports feeds with type "rss"`);
    }
    if (!url) {
      throw new Error(`Source file ${sourcePath} has a feed without a URL`);
    }

    normalizedFeeds.push({ type: 'rss', url });
  }

  if (normalizedFeeds.length === 0) {
    throw new Error(`Source file ${sourcePath} must include at least one feed`);
  }

  return {
    name,
    description,
    link,
    feeds: normalizedFeeds,
  };
}

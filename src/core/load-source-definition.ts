import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { z } from 'zod';
import type { SourceDefinition } from '../types.ts';

const feedEntrySchema = z.object({
  type: z.literal('rss'),
  url: z.string().trim().min(1, 'Feed URL is required'),
});

const sourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().trim().min(1, 'description is required'),
  link: z.string().trim().min(1, 'link is required'),
  feeds: z.array(feedEntrySchema).min(1, 'feeds must include at least one entry'),
});

export async function loadSourceDefinition(sourcePath: string): Promise<SourceDefinition> {
  const yamlText = await readFile(sourcePath, 'utf8');

  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlText);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to parse ${sourcePath}: ${message}`);
  }

  try {
    return sourceSchema.parse(parsed) as SourceDefinition;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const reasons = error.errors.map((entry) => entry.message).join('; ');
      throw new Error(`Source file ${sourcePath} is invalid: ${reasons}`);
    }
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Failed to validate ${sourcePath}: ${message}`);
  }
}

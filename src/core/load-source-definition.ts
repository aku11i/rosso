import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import type { SourceDefinition } from '../schema.ts';
import { sourceSchema } from '../schema.ts';

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

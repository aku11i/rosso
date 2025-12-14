import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import type { SourceDefinition } from '../schema.ts';
import { sourceSchema } from '../schema.ts';

export async function loadSourceDefinition(sourcePath: string): Promise<SourceDefinition> {
  const yamlText = await readFile(sourcePath, 'utf8');

  const parsed = YAML.parse(yamlText);
  const result = sourceSchema.safeParse(parsed);
  if (!result.success) {
    const reasons = result.error.errors.map((entry) => entry.message).join('; ');
    throw new Error(`Source file ${sourcePath} is invalid: ${reasons}`);
  }

  return result.data;
}

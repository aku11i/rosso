import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSource } from '../core/build-source.ts';
import { getDefaultCacheRoot } from '../utils/get-default-cache-root.ts';

const usageText =
  'Usage: rosso build <source> [--cache-dir <dir>] [--output-file <file>]\n' +
  '\n' +
  'Options:\n' +
  '  --cache-dir <dir>     Override the cache directory\n' +
  '  -o, --output-file     Write RSS output to a file\n' +
  '  -h, --help            Show this message\n';

export async function handleBuild(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: true,
    options: {
      'cache-dir': { type: 'string' },
      'output-file': { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(usageText);
    return;
  }

  if (positionals.length === 0) {
    throw new Error('Missing required source path');
  }

  const sourcePath = positionals[0];
  const cacheRoot = values['cache-dir'] ?? getDefaultCacheRoot();

  const rssXml = await buildSource({ cacheRoot, sourcePath });

  const outputFile = values['output-file'];
  if (outputFile) {
    await mkdir(path.dirname(outputFile), { recursive: true });
    const content = rssXml.endsWith('\n') ? rssXml : `${rssXml}\n`;
    await writeFile(outputFile, content, 'utf8');
    return;
  }

  console.log(rssXml);
}

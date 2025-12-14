import { parseArgs } from 'node:util';
import { fetchSource } from '../core/fetch-source.ts';
import { getDefaultCacheRoot } from '../utils/get-default-cache-root.ts';

const usageText =
  'Usage: rosso fetch [source] [--cache-dir <dir>]\n' +
  '\n' +
  'Options:\n' +
  '  --cache-dir <dir>  Override the cache directory\n' +
  '  -h, --help         Show this message\n';

export async function handleFetch(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      'cache-dir': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(usageText);
    return;
  }

  const sourcePath = positionals[0] ?? 'source.yaml';
  const cacheRoot = values['cache-dir'] ?? getDefaultCacheRoot();
  const result = await fetchSource({ cacheRoot, sourcePath });

  let totalItems = 0;
  for (const feed of result.feeds) {
    totalItems += feed.items.length;
  }

  console.log(`Fetched ${result.feeds.length} feeds (${totalItems} items)`);
}

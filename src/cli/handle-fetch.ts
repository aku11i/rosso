import { parseArgs } from 'node:util';
import { fetchSource } from '../core/fetch-source.ts';
import { getDefaultCacheRoot } from '../utils/get-default-cache-root.ts';
import { modelConfigSchema } from '../core/model-config.ts';

const usageText =
  'Usage: rosso fetch [source] [--cache-dir <dir>]\n' +
  '\n' +
  'Options:\n' +
  '  --cache-dir <dir>  Override the cache directory\n' +
  '  --model-provider <provider>  LLM provider (currently: openai)\n' +
  '  --model <name>  Model name (e.g., gpt-5-mini)\n' +
  '  --model-provider-api-key <key>  Provider API key (optional if env var is set)\n' +
  '  --model-provider-base-url <url>  Provider base URL (optional)\n' +
  '  -h, --help         Show this message\n';

export async function handleFetch(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: true,
    options: {
      'cache-dir': { type: 'string' },
      'model-provider': { type: 'string' },
      model: { type: 'string' },
      'model-provider-api-key': { type: 'string' },
      'model-provider-base-url': { type: 'string' },
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
  const modelProvider = values['model-provider'];
  const hasAnyModelOptions =
    modelProvider ||
    values.model ||
    values['model-provider-api-key'] ||
    values['model-provider-base-url'];

  const model = hasAnyModelOptions
    ? modelConfigSchema.parse({
        provider: values['model-provider'],
        model: values.model,
        apiKey: values['model-provider-api-key'],
        baseURL: values['model-provider-base-url'],
      })
    : undefined;

  const result = await fetchSource({ cacheRoot, sourcePath, model });

  let totalItems = 0;
  for (const feed of result.feeds) {
    totalItems += feed.items.length;
  }

  console.log(`Fetched ${result.feeds.length} feeds (${totalItems} items)`);
}

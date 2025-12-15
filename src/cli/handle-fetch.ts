import { parseArgs } from 'node:util';
import { fetchSource } from '../core/fetch-source.ts';
import { getDefaultCacheRoot } from '../utils/get-default-cache-root.ts';
import { modelProviderSchema } from '../core/model-config.ts';

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
  const hasAnyModelConfig =
    Boolean(values.model) ||
    Boolean(values['model-provider-api-key']) ||
    Boolean(values['model-provider-base-url']) ||
    Boolean(modelProvider);

  if (hasAnyModelConfig && !modelProvider) {
    throw new Error(
      'Missing --model-provider. Pass --model-provider openai with --model when using LLM options.',
    );
  }

  if (modelProvider && !values.model) {
    throw new Error('Missing --model. Pass --model <name> with --model-provider.');
  }

  if (modelProvider) {
    const parsedProvider = modelProviderSchema.safeParse(modelProvider);
    if (!parsedProvider.success) {
      throw new Error(`Unsupported --model-provider "${modelProvider}" (supported: openai)`);
    }
  }

  const model = modelProvider
    ? {
        provider: 'openai' as const,
        model: values.model as string,
        apiKey: values['model-provider-api-key'],
        baseURL: values['model-provider-base-url'],
      }
    : undefined;

  const result = await fetchSource({ cacheRoot, sourcePath, model });

  let totalItems = 0;
  for (const feed of result.feeds) {
    totalItems += feed.items.length;
  }

  console.log(`Fetched ${result.feeds.length} feeds (${totalItems} items)`);
}

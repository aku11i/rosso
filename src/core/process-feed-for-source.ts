import type { CachedFeed } from '../schema.ts';
import { modelProviderSchema, type ModelConfig } from './model-config.ts';
import { createOpenAI } from '@ai-sdk/openai';
import { filterFeedItemsWithLlm } from './filter-feed-items-with-llm.ts';
import { resolveGithubApiKey } from './resolve-github-api-key.ts';

export type ProcessFeedForSourceOptions = {
  sourcePath: string;
  feedUrl: string;
  feed: CachedFeed;
  filter?: { prompt?: string };
  model?: ModelConfig;
};

export async function processFeedForSource(
  options: ProcessFeedForSourceOptions,
): Promise<CachedFeed> {
  const filterPrompt = options.filter?.prompt?.trim();
  if (!filterPrompt) {
    return options.feed;
  }

  if (!options.model) {
    throw new Error(
      `Source file ${options.sourcePath} has "filter", but no model is configured. ` +
        'Pass --model-provider <provider> --model <name> (and optionally --model-provider-api-key).',
    );
  }

  modelProviderSchema.parse(options.model.provider);

  const apiKey =
    options.model.provider === 'github'
      ? await resolveGithubApiKey(options.model.apiKey)
      : options.model.apiKey;

  if (options.model.provider === 'github' && !apiKey) {
    throw new Error(
      'GitHub model provider requires an API key. ' +
        'Pass --model-provider-api-key, or set GITHUB_TOKEN, or login via `gh auth token`.',
    );
  }

  const provider = createOpenAI({
    apiKey,
    baseURL:
      options.model.provider === 'github'
        ? (options.model.baseURL ?? 'https://models.github.ai/inference')
        : options.model.baseURL,
  });

  const model =
    options.model.provider === 'github'
      ? provider.chat(options.model.model)
      : provider(options.model.model);
  const items = await filterFeedItemsWithLlm({
    model,
    filter: filterPrompt,
    feedUrl: options.feedUrl,
    items: options.feed.items,
  });

  return {
    ...options.feed,
    items,
  };
}

import type { CachedFeed } from '../schema.ts';
import { modelProviderSchema, type ModelConfig } from './model-config.ts';
import { createOpenAI } from '@ai-sdk/openai';
import { filterFeedItemsWithLlm } from './filter-feed-items-with-llm.ts';

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
        'Pass --model-provider openai --model <name> (and optionally --model-provider-api-key).',
    );
  }

  const parsedProvider = modelProviderSchema.safeParse(options.model.provider);
  if (!parsedProvider.success) {
    throw new Error(`Unsupported --model-provider "${options.model.provider}" (supported: openai)`);
  }

  const provider = createOpenAI({
    apiKey: options.model.apiKey,
    baseURL: options.model.baseURL,
  });

  const model = provider(options.model.model);
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

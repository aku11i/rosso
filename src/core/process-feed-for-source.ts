import type { CachedFeed } from '../schema.ts';
import type { ModelConfig } from './model-config.ts';
import { createOpenAI } from '@ai-sdk/openai';
import { filterFeedItemsWithLlm } from './filter-feed-items-with-llm.ts';
import type { FilterFeedItemsWithLlmOptions } from './filter-feed-items-with-llm.ts';

export type ProcessFeedForSourceOptions = {
  sourcePath: string;
  feedUrl: string;
  feed: CachedFeed;
  filter?: string;
  model?: ModelConfig;
  generateObjectFn?: FilterFeedItemsWithLlmOptions['generateObjectFn'];
};

export async function processFeedForSource(
  options: ProcessFeedForSourceOptions,
): Promise<CachedFeed> {
  if (!options.filter) {
    return options.feed;
  }

  if (!options.model) {
    throw new Error(
      `Source file ${options.sourcePath} has "filter", but no model is configured. ` +
        'Pass --model-provider openai --model <name> (and optionally --model-provider-api-key).',
    );
  }

  if (options.model.provider !== 'openai') {
    throw new Error(`Unsupported --model-provider "${options.model.provider}" (supported: openai)`);
  }

  const provider = createOpenAI({
    apiKey: options.model.apiKey,
    baseURL: options.model.baseURL,
  });

  const model = provider(options.model.model);
  const items = await filterFeedItemsWithLlm({
    model,
    filter: options.filter,
    feedUrl: options.feedUrl,
    items: options.feed.items,
    generateObjectFn: options.generateObjectFn,
  });

  return {
    ...options.feed,
    items,
  };
}

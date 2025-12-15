import type { RawCachedFeed } from '../schema.ts';
import { modelProviderSchema, type ModelConfig } from './model-config.ts';
import { filterFeedItemsWithLlm } from './filter-feed-items-with-llm.ts';
import { resolveLanguageModelFromConfig } from './resolve-language-model.ts';

export type ProcessFeedForSourceOptions = {
  sourcePath: string;
  feedUrl: string;
  feed: RawCachedFeed;
  filter?: { prompt?: string };
  model?: ModelConfig;
};

export async function processFeedForSource(
  options: ProcessFeedForSourceOptions,
): Promise<RawCachedFeed> {
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
  const model = await resolveLanguageModelFromConfig(options.model);
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

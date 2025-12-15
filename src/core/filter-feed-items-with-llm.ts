import { generateObject } from 'ai';
import type { LanguageModel } from 'ai';
import { z } from 'zod';
import type { CachedItem } from '../schema.ts';

const outputSchema = z.object({
  links: z.array(z.string().trim().min(1)),
});

export type FilterFeedItemsWithLlmOptions = {
  model: LanguageModel;
  filter: string;
  feedUrl: string;
  items: CachedItem[];
};

export async function filterFeedItemsWithLlm(
  options: FilterFeedItemsWithLlmOptions,
): Promise<CachedItem[]> {
  if (options.items.length === 0) {
    return [];
  }

  const selectedLinks = new Set<string>();

  for (let start = 0; start < options.items.length; start += 10) {
    const chunk = options.items.slice(start, start + 10);
    const allowedLinks = new Set(chunk.map((item) => item.link));

    const system = [
      '<instructions>',
      'You are an RSS feed item filter.',
      'Select only the items that match the given filter criteria.',
      '</instructions>',
      '',
      `<filterCriteria>`,
      options.filter,
      `</filterCriteria>`,
      '',
      '<rules>',
      '- Only select from the provided items.',
      '- Use item link strings exactly as provided.',
      '- Return a JSON object that matches the output schema.',
      '- If no items match, return an empty array of links.',
      '</rules>',
    ].join('\n');

    const prompt = [
      `Feed URL: ${options.feedUrl}`,
      '',
      'Items (JSON):',
      JSON.stringify(
        chunk.map((item) => ({
          link: item.link,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
        })),
      ),
      '',
      'Return the result.',
    ].join('\n');

    const result = await generateObject({
      model: options.model,
      schema: outputSchema,
      schemaName: 'SelectedFeedItemLinks',
      schemaDescription: 'A list of RSS item links that match the filter criteria.',
      system,
      prompt,
    });

    for (const link of result.object.links) {
      if (allowedLinks.has(link)) {
        selectedLinks.add(link);
      }
    }
  }

  return options.items.filter((item) => selectedLinks.has(item.link));
}

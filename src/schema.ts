import { z } from 'zod';

export const feedEntrySchema = z.object({
  type: z.literal('rss'),
  url: z.string().trim().min(1, 'Feed URL is required'),
});

export const sourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().trim().min(1, 'description is required'),
  link: z.string().trim().min(1, 'link is required'),
  feeds: z.array(feedEntrySchema).min(1, 'feeds must include at least one entry'),
});

export type FeedEntry = z.infer<typeof feedEntrySchema>;
export type SourceDefinition = z.infer<typeof sourceSchema>;

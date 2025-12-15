import { z } from 'zod';

export const feedEntrySchema = z.object({
  type: z.literal('rss'),
  url: z.string().trim().min(1, 'Feed URL is required'),
});

export const cachedItemSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  link: z.string(),
  timestamp: z.string(),
});

export const rawCachedFeedSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string(),
  items: z.array(cachedItemSchema),
});

export const sourceCachedFeedSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string(),
  items: z.array(cachedItemSchema),
  omittedLinks: z.array(z.string().trim().min(1)).optional(),
});

export const sourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().trim().min(1, 'description is required'),
  link: z.string().trim().min(1, 'link is required'),
  filter: z
    .object({
      prompt: z.string().trim().min(1, 'filter.prompt is required').optional(),
    })
    .optional(),
  feeds: z.array(feedEntrySchema).min(1, 'feeds must include at least one entry'),
});

export type FeedEntry = z.infer<typeof feedEntrySchema>;
export type CachedItem = z.infer<typeof cachedItemSchema>;
export type RawCachedFeed = z.infer<typeof rawCachedFeedSchema>;
export type SourceCachedFeed = z.infer<typeof sourceCachedFeedSchema>;
export type SourceDefinition = z.infer<typeof sourceSchema>;

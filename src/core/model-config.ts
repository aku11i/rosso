import { z } from 'zod';

export const modelProviderSchema = z.union([z.literal('openai'), z.literal('github')]);
export type ModelProvider = z.infer<typeof modelProviderSchema>;

export const modelConfigSchema = z.object({
  provider: modelProviderSchema,
  model: z.string().trim().min(1),
  apiKey: z.string().trim().min(1).optional(),
  baseURL: z.string().trim().min(1).optional(),
});

export type ModelConfig = {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
};

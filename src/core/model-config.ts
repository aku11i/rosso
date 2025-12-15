import { z } from 'zod';

export const modelProviderSchema = z.literal('openai');
export type ModelProvider = z.infer<typeof modelProviderSchema>;

export type ModelConfig = {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
};

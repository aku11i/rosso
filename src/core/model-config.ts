export type ModelProvider = 'openai';

export type ModelConfig = {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
};

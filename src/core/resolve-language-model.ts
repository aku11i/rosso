import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { ModelConfig } from './model-config.ts';
import { getGithubToken } from '../utils/get-github-token.ts';

export async function resolveLanguageModelFromConfig(config: ModelConfig): Promise<LanguageModel> {
  const apiKey =
    config.provider === 'github'
      ? config.apiKey?.trim() || (await getGithubToken())
      : config.apiKey;

  if (config.provider === 'github' && !apiKey) {
    throw new Error(
      'GitHub model provider requires an API key. ' +
        'Pass --model-provider-api-key, or set GITHUB_TOKEN, or login via `gh auth token`.',
    );
  }

  const provider = createOpenAI({
    apiKey,
    baseURL:
      config.provider === 'github'
        ? (config.baseURL ?? 'https://models.github.ai/inference')
        : config.baseURL,
  });

  return config.provider === 'github' ? provider.chat(config.model) : provider(config.model);
}

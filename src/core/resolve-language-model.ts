import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { ModelConfig } from './model-config.ts';
import { getGithubToken } from '../utils/get-github-token.ts';
import { getOpenAiApiKey } from '../utils/get-openai-api-key.ts';

export async function resolveLanguageModelFromConfig(config: ModelConfig): Promise<LanguageModel> {
  switch (config.provider) {
    case 'openai': {
      const apiKey = config.apiKey?.trim() || getOpenAiApiKey();
      const provider = createOpenAI({
        ...(apiKey ? { apiKey } : {}),
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      });
      return provider(config.model);
    }
    case 'github': {
      const apiKey = config.apiKey?.trim() || (await getGithubToken());
      if (!apiKey) {
        throw new Error(
          'GitHub model provider requires an API key. ' +
            'Pass --model-provider-api-key, or set GITHUB_TOKEN, or login via `gh auth token`.',
        );
      }

      const provider = createOpenAI({
        apiKey,
        baseURL: config.baseURL ?? 'https://models.github.ai/inference',
      });
      return provider.chat(config.model);
    }
  }
}

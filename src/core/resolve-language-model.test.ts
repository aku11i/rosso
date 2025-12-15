import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

let capturedOptions: unknown[] = [];

mock.module('@ai-sdk/openai', {
  namedExports: {
    createOpenAI: (options: unknown) => {
      capturedOptions.push(options);
      const provider = ((model: string) => ({ model })) as unknown as {
        (model: string): unknown;
        chat(model: string): unknown;
      };
      provider.chat = (model: string) => ({ model, chat: true });
      return provider;
    },
  },
});

const { resolveLanguageModelFromConfig } = await import('./resolve-language-model.ts');

test('openai resolves API key with flag precedence over env', async () => {
  const original = process.env.OPENAI_API_KEY;

  try {
    process.env.OPENAI_API_KEY = 'from-env';
    capturedOptions = [];
    await resolveLanguageModelFromConfig({
      provider: 'openai',
      model: 'gpt-5-mini',
      apiKey: 'from-flag',
    });
    assert.deepEqual(capturedOptions[0], { apiKey: 'from-flag' });

    process.env.OPENAI_API_KEY = 'from-env';
    capturedOptions = [];
    await resolveLanguageModelFromConfig({ provider: 'openai', model: 'gpt-5-mini' });
    assert.deepEqual(capturedOptions[0], { apiKey: 'from-env' });
  } finally {
    if (typeof original === 'string') {
      process.env.OPENAI_API_KEY = original;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  }
});

export function getOpenAiApiKey(): string | undefined {
  const token = process.env.OPENAI_API_KEY?.trim();
  return token ? token : undefined;
}

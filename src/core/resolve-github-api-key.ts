import { execFile } from 'node:child_process';

export async function resolveGithubApiKey(explicitApiKey?: string): Promise<string | undefined> {
  const direct = explicitApiKey?.trim();
  if (direct) {
    return direct;
  }

  const envToken = process.env.GITHUB_TOKEN?.trim();
  if (envToken) {
    return envToken;
  }

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      execFile('gh', ['auth', 'token'], { timeout: 5000 }, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(String(stdout));
      });
    });
    const token = stdout.trim();
    return token ? token : undefined;
  } catch {
    return undefined;
  }
}

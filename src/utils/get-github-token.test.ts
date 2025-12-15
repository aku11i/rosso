import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

type ExecFileCallback = (error: Error | null, stdout: string) => void;

let execFileCalls = 0;
let execFileHandler = (
  _file: string,
  _args: string[],
  _options: Record<string, unknown>,
  callback: ExecFileCallback,
) => callback(null, '');

mock.module('node:child_process', {
  namedExports: {
    execFile: (
      file: string,
      args: string[],
      options: Record<string, unknown>,
      callback: ExecFileCallback,
    ) => {
      execFileCalls += 1;
      execFileHandler(file, args, options, callback);
    },
  },
});

let getGithubToken: typeof import('./get-github-token.ts').getGithubToken;

const originalGithubToken = process.env.GITHUB_TOKEN;

test.before(async () => {
  ({ getGithubToken } = await import('./get-github-token.ts'));
});

test.beforeEach(() => {
  execFileCalls = 0;
  execFileHandler = (
    _file: string,
    _args: string[],
    _options: Record<string, unknown>,
    callback: ExecFileCallback,
  ) => callback(null, '');
  process.env.GITHUB_TOKEN = originalGithubToken;
});

test.after(() => {
  process.env.GITHUB_TOKEN = originalGithubToken;
});

test('getGithubToken returns GITHUB_TOKEN when set', async () => {
  execFileHandler = () => {
    throw new Error('execFile should not be called');
  };
  process.env.GITHUB_TOKEN = 'env-token';

  const token = await getGithubToken();
  assert.equal(token, 'env-token');
  assert.equal(execFileCalls, 0);
});

test('getGithubToken falls back to `gh auth token`', async () => {
  delete process.env.GITHUB_TOKEN;
  execFileHandler = (file, args, options, callback) => {
    assert.equal(file, 'gh');
    assert.deepEqual(args, ['auth', 'token']);
    assert.equal(options.timeout, 5000);
    callback(null, 'gh-token\n');
  };

  const token = await getGithubToken();
  assert.equal(token, 'gh-token');
  assert.equal(execFileCalls, 1);
});

test('getGithubToken returns undefined when `gh auth token` fails', async () => {
  delete process.env.GITHUB_TOKEN;
  execFileHandler = (_file, _args, _options, callback) => {
    callback(new Error('fail'), '');
  };

  const token = await getGithubToken();
  assert.equal(token, undefined);
  assert.equal(execFileCalls, 1);
});

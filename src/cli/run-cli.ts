import { handleFetch } from './handle-fetch.ts';
import { handleBuild } from './handle-build.ts';

const usageText =
  'Usage: rosso <command>\n' +
  '\n' +
  'Commands:\n' +
  '  fetch [source] [--cache-dir <dir>] [--model-provider <provider>]  Fetch RSS feeds defined in a source.yaml file\n' +
  '  build <source> [--cache-dir <dir>] [--output-file <file>]  Build an aggregated RSS feed from cached data\n' +
  '  --help                               Show this message\n';

export async function runCli(argv: string[]) {
  const args = argv[0] === '--' ? argv.slice(1) : argv;
  const [command, ...rest] = args;

  if (!command || command === '--help' || command === '-h') {
    console.log(usageText);
    return;
  }

  if (command === 'fetch') {
    await handleFetch(rest);
    return;
  }

  if (command === 'build') {
    await handleBuild(rest);
    return;
  }

  console.error(`Unknown command "${command}".`);
  console.log(usageText);
  process.exitCode = 1;
}

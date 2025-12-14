import { handleFetch } from './handle-fetch.ts';

const usageText =
  'Usage: rosso <command>\n' +
  '\n' +
  'Commands:\n' +
  '  fetch [source] [--cache-dir <dir>]  Fetch RSS feeds defined in a source.yaml file\n' +
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

  console.error(`Unknown command "${command}".`);
  console.log(usageText);
  process.exitCode = 1;
}

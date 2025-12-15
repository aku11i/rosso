#!/usr/bin/env node
import { runCli } from './cli/run-cli.ts';

try {
  await runCli(process.argv.slice(2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

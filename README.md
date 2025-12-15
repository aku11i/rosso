# rosso

Node.js CLI for fetching RSS feeds defined in a `source.yaml` file and caching the results.

## Getting started
- Install dependencies: `pnpm install`
- See commands: `pnpm start -- --help`
- Build `dist/`: `pnpm build`
- Fetch sources: `pnpm start -- fetch <source.yaml> [--cache-dir <dir>]`
- Build aggregated RSS: `pnpm start -- build <source.yaml> [--cache-dir <dir>] [--output-file <file>]`
- Run tests: `pnpm test`
- Requires Node.js 22 or newer

## Source file
- Must be provided explicitly to the fetch command
- Required keys: `name`, `description`, `link`, `feeds`
- Optional keys: `filter` (LLM-based item filtering; see below)
- Each feed entry: `{ type: rss, url: string }`; duplicates are removed per URL

## LLM filtering (optional)
If `filter` is present in your `source.yaml`, `rosso fetch` filters each feed's cached items using an LLM.

- LLM calls use Vercel AI SDK `generateObject` with a structured output schema.
- Feed items are processed in chunks of 10 per LLM call.
- `filter` format: `filter: { prompt: "<your criteria>" }`
- Required CLI flags: `--model-provider openai --model <name>`
- Optional: `--model-provider-api-key <key>` and `--model-provider-base-url <url>`

## Cache
- Default location: OS user cache dir (e.g., `$XDG_CACHE_HOME/rosso` on Linux)
- Override with `--cache-dir`
- Raw feed cache (shared across sources): `<cacheRoot>/feeds/{sha256(feedUrl)}.json`
- Source-specific cache (per source x feed): `<cacheRoot>/sources/{sha256(realpath(source.yaml))}/feeds/{sha256(feedUrl)}.json`
- Each cached feed stores `title`, `description`, `url`, `items[]` with `title`, `description`, `link`, `timestamp`

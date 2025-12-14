# rosso

Node.js CLI for fetching RSS feeds defined in a `source.yaml` file and caching the results.

## Getting started
- Install dependencies: `pnpm install`
- See commands: `pnpm start -- --help`
- Fetch sources: `pnpm start -- fetch <source.yaml> [--cache-dir <dir>]`
- Run tests: `pnpm test`
- Requires Node.js 22 or newer

## Source file
- Must be provided explicitly to the fetch command
- Required keys: `name`, `description`, `link`, `feeds`
- Each feed entry: `{ type: rss, url: string }`; duplicates are removed per URL

## Cache
- Default location: OS user cache dir (e.g., `$XDG_CACHE_HOME/rosso` on Linux)
- Override with `--cache-dir`
- Structure: `<cacheRoot>/feeds/{sha256(feedUrl)}.json`
- Each cached feed stores `title`, `description`, `url`, `items[]` with `title`, `description`, `link`, `timestamp`

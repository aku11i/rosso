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
- Each feed entry: `{ type: rss, url: string }`; duplicates are removed per URL

## Cache
- Default location: OS user cache dir (e.g., `$XDG_CACHE_HOME/rosso` on Linux)
- Override with `--cache-dir`
- Raw feed cache (shared across sources): `<cacheRoot>/feeds/{sha256(feedUrl)}.json`
- Source-specific cache (per source x feed): `<cacheRoot>/sources/{sha256(realpath(source.yaml))}/feeds/{sha256(feedUrl)}.json`
- Each cached feed stores `title`, `description`, `url`, `items[]` with `title`, `description`, `link`, `timestamp`

## Releases
- Run the `Version bump` workflow to open a release PR.
- Merge the PR to create a `vX.Y.Z` tag automatically.
- Publish by creating a GitHub Release for that tag (triggers `Publish to npm`).
- npm publishing is configured for OIDC/trusted publishing (no `NPM_TOKEN` in GitHub secrets).

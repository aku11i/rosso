# Rosso

Build an RSS feed from various sources.

Rosso is a small CLI that lets you combine multiple RSS feeds into a single feed for your reader.

- `fetch`: downloads RSS feeds defined in `source.yaml` and caches items locally (as JSON)
- `build`: generates an aggregated RSS feed from the cache (offline; no network access)

## Install

```bash
npm install -g @aku11i/rosso
```

Requires Node.js `>=22`.

## Quick start

Create `source.yaml`:

```yaml
name: My Feed
description: A combined feed for my reader
link: https://example.com/
feeds:
  - type: rss
    url: https://blog.example.com/rss.xml
  - type: rss
    url: https://news.example.com/feed.xml
```

Fetch and cache:

```bash
rosso fetch source.yaml
```

Build an RSS file:

```bash
rosso build source.yaml --output-file ./dist/rosso.xml
```

If you omit `--output-file`, Rosso prints the RSS XML to stdout.

## `source.yaml` format

Required fields:

- `name`
- `description`
- `link`
- `feeds`

Feed entries:

```yaml
feeds:
  - type: rss
    url: https://example.com/feed.xml
```

Duplicate feed URLs are removed within the same source.

### Optional filtering (LLM)

Add a filter prompt:

```yaml
filter:
  prompt: Keep items about TypeScript and Node.js.
```

Then pass a model when running `fetch`:

```bash
rosso fetch source.yaml --model-provider openai --model gpt-5-mini
```

Providers: `openai`, `github`.

## Cache

- Default location: your OS user cache directory
- Override: `--cache-dir <dir>`
- `fetch` updates the cache using the network
- `build` reads only from the cache (no network)

## CLI

- `rosso fetch <source> [--cache-dir <dir>] [--model-provider ...]`
- `rosso build <source> [--cache-dir <dir>] [--output-file <file>]`

Run `rosso --help` for full usage.

## License

MIT (see `LICENSE`).

## Development

- Requires Node.js `>=22`
- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`

# Repository Guidelines

## Language Policy
- Use English for all repository artifacts: code comments, docs, filenames, commit messages, Issues, Pull Requests, and Releases.

## Project Structure & Module Organization
- Current tree: `README.md`, `LICENSE`. Add application code under `src/`, unit tests under `tests/`, helper scripts under `scripts/`, and docs under `docs/`. Use `assets/` for static files and `examples/fixtures/` for sample data.
- Keep modules small; one responsibility per file. Choose a single entry point such as `src/main.*` or `src/lib.*` and mirror that layout inside `tests/`.
- Rosso initial layout:
  - `src/main.ts`: entry point.
  - `src/index.ts`: exports the `src/core` public API.
  - `src/cli`: CLI interface (help, command handlers, etc.).
  - `src/core`: core logic used by CLI handlers (fetch/build, etc.).
  - `src/utils`: generic utility functions.
  - Subdirectories under `src/cli` and `src/core` are allowed (e.g. `src/cli/handlers`).

## Build, Test, and Development Commands
- Standardize on a root `Makefile` or `justfile` once tooling exists. Recommended targets:
  - `make setup` – install dependencies.
  - `make lint` – run formatters/linters.
  - `make test` – run unit/integration tests; keep it idempotent.
  - `make run` – start the local app/CLI.
- If you add ad-hoc scripts, place them in `scripts/`, make them POSIX-shell compatible, and call them from the targets above (e.g., `scripts/test.sh` invoking `pytest` or `npm test`).

## Coding Style & Naming Conventions
- Enforce automatic formatting (e.g., `prettier`, `ruff`/`black`, `gofmt`, or `rustfmt` depending on the chosen stack) and commit the config at the repo root.
- Indentation: 2 spaces for JS/TS/web assets, 4 for Python, tabs for Go. Keep line length ≤100 characters.
- Filenames: `kebab-case` for scripts, `snake_case` for Python modules and test files, `CamelCase` only for type/class definitions. Keep directories lowercase and hyphenated.
- TypeScript source filenames: `param-case.ts`.
- One file should contain at most one function or one class.
- Prefer DRY reusable code.

## CLI & Config (Agreed)
- Each aggregated feed is defined by a `source.yaml` file (default: `./source.yaml`).
- `source.yaml` required fields: `name`, `description`, `link`, `feeds`.
- `feeds` entries: `{ type: rss, url: string }` (dedupe duplicate entries via a Set).
- Commands:
  - `rosso fetch [source] [--cache-dir <dir>]`: fetch sources and update cache.
  - `rosso build [source] [--cache-dir <dir>]`: build the aggregated RSS feed from cache (offline; no network access).
- Cache:
  - Default location: OS standard user cache directory.
  - Override via `--cache-dir`.
  - `fetch` stores JSON (not raw XML): `item.title`, `item.description`, `item.link`, and an item timestamp (publication datetime; fallback to fetch timestamp when missing). Items without `item.link` are excluded.
- Item deduplication: only within the same source feed using `feed url + item link`; do not deduplicate across different sources.
- Parsers: YAML `yaml`; RSS `@rowanmanning/feed-parser`.

## Testing Guidelines
- Mirror source structure inside `tests/`; name files `<module>_test.<ext>` or `<module>.spec.<ext>`.
- Target ≥80% coverage once tooling is in place; add regression tests alongside bug fixes.
- Store fixtures under `tests/fixtures/`; keep integration tests hermetic (no network calls without mocks).

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat: add parser`, `fix: handle empty input`). Keep subjects ≤72 characters and include a scope when helpful.
- One logical change per commit; squash noisy WIP before opening a PR.
- PRs should include a summary, test evidence (e.g., `make test` output), linked issue or goal, screenshots/logs for user-facing changes, and migration notes when behavior shifts.
- Use GitHub CLI (`gh`) for repository actions (Issues, Pull Requests, Releases); favor `gh issue/pr/release` commands.

## Security & Configuration
- Never commit secrets; provide a `.env.example` describing required variables and load via your language’s standard env tooling.
- Update `.gitignore` when introducing new build artifacts; avoid committing large binaries—prefer generating them locally or storing small assets in `assets/`.

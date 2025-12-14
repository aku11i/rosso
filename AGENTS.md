# Repository Guidelines

## Language Policy
- Use English for all repository artifacts: code comments, docs, filenames, commit messages, Issues, Pull Requests, and Releases.

## Project Structure & Module Organization
- Current tree: `README.md`, `LICENSE`. Add application code under `src/`, unit tests under `tests/`, helper scripts under `scripts/`, and docs under `docs/`. Use `assets/` for static files and `examples/fixtures/` for sample data.
- Keep modules small; one responsibility per file. Choose a single entry point such as `src/main.*` or `src/lib.*` and mirror that layout inside `tests/`.

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

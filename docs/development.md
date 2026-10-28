---
description: "Developer setup, commands, test structure, generated artifacts, cap authoring, and privacy checks for the GBP Scorecard."
---

# Development

## Requirements

- Node.js 22+
- Python 3.10+
- git

There are no runtime npm dependencies. Documentation uses pinned Python packages in `requirements-docs.txt`.

For the docs toolchain, use a local virtual environment:

```sh
python3 -m venv .venv-docs
. .venv-docs/bin/activate
pip install -r requirements-docs.txt
```

`.venv-docs/` is gitignored.

## Setup

```sh
git clone https://github.com/thatguynef/gbp-scorecard.git
cd gbp-scorecard
npm run doctor
npm test
npm run check
```

`npm run check` runs tests, rubric validation, generated-file freshness, schemas, links, assets, and the privacy scan. It does not require credentials.

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Python scorer tests + Node pipeline tests |
| `npm run check:rubric` | Validate canonical rubric structure |
| `npm run check:generated` | Reject stale generated artifacts |
| `npm run check:schemas` | Validate schemas and sample artifacts |
| `npm run check:links` | Broken relative Markdown links |
| `npm run check:assets` | Image existence, alt text, SVG titles, budgets |
| `npm run check:privacy` | Tracked/untracked secret and PII scan |
| `npm run judge` | Merge a structured judgment proposal into an audit |
| `npm run verify:example` | Verify the synthetic example with mutations |
| `npm run docs:build` | Strict MkDocs build |
| `npm run render:assets` | Regenerate SVG documentation art |

## Authoring a check

1. Edit `references/rubric.json`.
2. Keep category maxima at 100.
3. Add a unique `GBP-XXX-NN` ID.
4. Add a journey stage, evidence types, evaluation method, applicability, severity, and anchors for every allowed score.
5. Add a deterministic fix mapping.
6. Regenerate:

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/render_rubric.py
python3 .opencode/skills/home-service-gbp-audit/scripts/render_coverage.py
python3 .opencode/skills/home-service-gbp-audit/scripts/render_portable.py
```

7. Update tests and, if the check is in the golden fixture, the expected score.
8. Run `npm run check` and `npm run verify:example`.

A check must answer a customer-journey question. "A generic GBP checklist says so" is not sufficient.

## Authoring a cap

A cap needs:

- a deterministic trigger in `facts`,
- at least one check ID,
- a written rationale,
- a unit test,
- fixture coverage if the example uses it,
- documentation.

Do not add a cap for a stylistic issue or an optional opportunity.

## Tests

- `test_score.py` covers golden scoring, N/A normalization, owner-data exclusion, every cap, evidence validation, fact conflicts, credential rejection, and rounding.
- `test_pipeline.mjs` covers rubric validation, deterministic scoring, fixture collection, no-credential failure, rendering, verification, privacy scanning, and malformed input.
- `verify.mjs --mutation` intentionally breaks artifacts and requires detection.

## Generated files

Generated, do not hand-edit:

- `references/rubric.md`
- `references/coverage-matrix.json`
- `references/portable-checklist.md`
- `docs/assets/*.svg`

CI compares regenerated content with tracked content.

## Adding a collector field

- Record the source, timestamp, collector version, and field completeness.
- Do not store credentials, auth headers, cookies, or customer PII.
- Do not store review author names or review text in public artifacts.
- Add a fixture and a schema change if the field is scored.
- Keep the collector non-destructive.

## Privacy

Before committing:

```sh
git status
git diff
git diff --cached
git ls-files
npm run check:privacy
```

A public repository exposes every tracked file and every commit. See [Privacy](privacy.md).

## Release

Follow [Release checklist](release-checklist.md).

# Structured output

Every artifact is versioned and carries enough provenance to answer: where did this come from, when was it collected, was it observed or API-derived, and which audit mode produced it?

## Files

| File | Schema | Purpose |
|---|---|---|
| `audit.json` | `raw-audit-v1.schema.json` | Pending collector worksheet |
| `audit.filled.json` | `audit-v1.schema.json` | Scored audit input with facts and checks |
| `scores.json` | `scores-v1.schema.json` | Deterministic score output |
| `verification.json` | `verification-v1.schema.json` | Verifier record |

Schemas live in `.opencode/skills/home-service-gbp-audit/references/schema/`.

Run:

```sh
npm run check:schemas
```

## `audit.filled.json`

```json
{
  "schema_version": "1.0",
  "audit_mode": "public",
  "run": {},
  "business": {},
  "configuration": {},
  "sources": [],
  "profile": {},
  "actions": {},
  "handoff": {},
  "reviews": {},
  "media": {},
  "measurement": {},
  "facts": {},
  "checks": {},
  "limitations": []
}
```

Key blocks:

- **`run`**: run ID, timestamps, collector version, rubric version, source mode (`fixture` or `live`), synthetic flag.
- **`business`**: name, trade, market, synthetic place ID, website, phone, address.
- **`configuration`**: applicability booleans.
- **`sources`**: source ID, type, collected time, collector version, field completeness, endpoint metadata without credentials.
- **`profile`**: status, name, categories, description, attributes, hours, location mode.
- **`actions`**: phone, website, booking, messaging, directions, other, with presence, usability, and destination state.
- **`handoff`**: HTTPS, resolution, final URL, identity match, title.
- **`reviews`**: rating, count, owner-response count, distribution, sample ratings and dates without author names.
- **`media`**: count, business-owned count, recent count, categories.
- **`measurement`**: observable source parameter names, not secret values.
- **`facts`**: the nine structured cap facts. They must restate observations.
- **`checks`**: all 49 canonical checks.
- **`limitations`**: public-mode limitations.

No credentials, authorization headers, cookies, customer names, customer emails, customer phone numbers, or private review text.

## `scores.json`

Important fields:

| Field | Meaning |
|---|---|
| `categories` | Earned, applicable max, weight, normalized, N/A checks |
| `checks` | Every check with score, confidence, evidence, and references |
| `findings` | Checks with lost points |
| `verifiedFindings` | Findings backed by direct observation |
| `strongSignals` | Findings whose business consequence is not proven |
| `recommendations` | Deterministic fixes sorted by priority and lost points |
| `ownerDataRequired` | Owner questions with `publicScoreImpact: none` |
| `journey` | Stage statuses and earned/applicable points |
| `coverage` | One row per check, including N/A reasons |
| `opportunities` | Unscored opportunity flags |
| `normalization` | Applicable weight, raw total, N/A checks, category caps |
| `caps` | Active and binding caps with deterministic triggers |
| `total`, `final`, `display`, `band` | Score, cap-adjusted score, display score, band |
| `sources` | Provenance for downstream tools |
| `meta` | Run, client, trade, market, audit mode, versions |

Owner-data IDs never appear in `checks`. `ownerDataRequired` entries have `"publicScoreImpact": "none"`.

## `verification.json`

```json
{
  "schema_version": "1.0",
  "run_id": "2026-10-26T1000-acme",
  "verifier": "verify.mjs",
  "date": "2026-10-27",
  "rubric_version": "1.0.0",
  "audit_mode": "public",
  "result": "pass",
  "checks": {},
  "hard_failures": [],
  "soft_failures": [],
  "mutation_tests": "pass",
  "mutations": [],
  "fixture": {},
  "score": 68,
  "word_count": 1049,
  "waivers": []
}
```

## Versioning

- `schema_version` is the artifact contract.
- `rubric_version` is the canonical methodology.
- `scorer_version`, `collector_version`, and `verifier` identify the executable stage.

An unknown `schema_version` fails safely. A rubric version mismatch fails. A historical score can be reproduced with the matching rubric and audit.

## Downstream use

RAD or another system may consume:

- `scores.json` for findings, confidence, category math, owner-data questions, and fix mappings,
- `verification.json` for release status,
- `coverage-matrix.json` for the check inventory.

The machine-readable fix mapping lives in `rubric.json` under `fixes` and includes `checkId`, `priority`, `fix`, and `radModules`. A downstream system must not treat a recommended module as a diagnosis.

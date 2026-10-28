---
description: "How GBP collection, review, scoring, rendering, and verification stay separate and independently runnable."
---

# Architecture

GBP Scorecard keeps collection, judgment, scoring, rendering, and verification separate. Each stage is independently runnable.

```text
COLLECT
public observations + source metadata
        ↓
REVIEW
human or model fills only what needs judgment
        ↓
SCORE
validate · applicability · normalization · caps
        ↓
RENDER
one-page + full report
        ↓
VERIFY
invariants · cross-artifact checks · mutation tests
```

## Stage 1 — Collect

`collect.mjs` writes a **pending worksheet** to `.audit/<slug>/<run-id>/`:

- `audit.json` — observations, sources, and 49 unscored check placeholders,
- `run.json` — manifest with audit mode, source mode, versions, and non-destructive flag.

Public Mode prefers supported APIs over brittle scraping. It uses the Google Places API (New) for publicly available place data and a non-destructive HTTP inspector for the destination. It never posts, replies, books, calls, texts, submits a form, creates an account, or changes a profile.

The collector does not pretend the Places API exposes the complete profile. Services, attributes, owner responses, posts, and some action types are left for public profile review with explicit notes. A missing field is not scored zero.

Fixture mode reads synthetic observations and performs no network access or credential lookup.

## Stage 2 — Review

A reviewer fills every applicable check in `audit.filled.json`:

- score from the allowed anchors,
- evidence strings,
- source references,
- confidence state,
- cap facts that restate structured observations.

Only judgment checks should use a model. Facts such as rating, review count, link resolution, and hours are deterministic. A model proposal is merged with `apply_judgment.mjs`, which accepts only model-judgment checks and requires evidence references. The reviewer must not invent unavailable data.

## Stage 3 — Score

`score.py` validates the filled audit, removes N/A checks, normalizes category weights to 100, applies deterministic category and overall caps, and writes `scores.json`.

The scorer never contacts the business. It is file-based and deterministic.

## Stage 4 — Render

`render.mjs` combines `scores.json` with reviewer-written `content.json`. The renderer owns:

- score strings,
- category and journey tables,
- check rows,
- fix point limits,
- confidence labels,
- synthetic label,
- provenance table.

The model owns prose: verdict, findings, strengths, next steps, limitations. It cannot invent check IDs, owner-data IDs, or points.

## Stage 5 — Verify

`verify.mjs` independently recomputes the math and checks:

- check IDs and category weights,
- applicability and structural N/A,
- score bounds, evidence, confidence, source references,
- fact consistency and cap triggers,
- category and total math,
- owner-data exclusion,
- report score and category rows,
- full-report finding rows,
- synthetic labels,
- top-finding linkage,
- fix point claims,
- required sections,
- local report links,
- no placeholders,
- no credential-like material.

It runs a mutation suite that intentionally breaks totals, category scores, confidence, evidence, caps, labels, report linkage, and owner-data exclusion. If a mutation survives, verification fails.

## Why the stages stay separate

A monolith is hard to audit. Separating files makes it possible to:

- inspect raw observations without re-running collection,
- change a report without changing a score,
- reproduce a historical score,
- test a cap in isolation,
- replace the judgment layer with fixtures,
- run CI with no credentials and no network.

`npm run audit` is a wrapper that prints the next commands. It is not an opaque scoring engine.

## Audit modes

Public Mode is the only implemented mode. Connected Mode is a future, authorized read-only mode. Each run records `audit_mode`. The public score is never silently rewritten with connected performance data; connected diagnostics will be reported separately.

## Non-destructive boundary

The collector and destination inspector:

- use GET/search requests only,
- do not submit forms,
- do not create bookings,
- do not place calls or send messages,
- do not create accounts,
- do not enter payments,
- do not mutate a profile,
- use explicit timeouts, bounded retries, and bounded response reads.

## Repository layout

```text
.opencode/skills/home-service-gbp-audit/
  SKILL.md
  references/
    rubric.json
    rubric.md
    coverage-matrix.json
    portable-checklist.md
    fix-library.md
    templates
    schema/
  scripts/
    collect.mjs
    score.py
    render.mjs
    verify.mjs
    eval.mjs
    generators and tests
examples/acme-plumbing/
docs/
scripts/
```

See [Development](development.md) for commands and test structure.

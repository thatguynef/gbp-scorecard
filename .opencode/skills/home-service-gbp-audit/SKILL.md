---
name: Home Service GBP Audit
description: Diagnose how effectively a local home-service business's public Google Business Profile supports understanding, trust, action, handoff, and measurement. Collect public evidence, separate verified findings from strong signals and owner-data questions, score the profile deterministically, and produce a contractor-facing report plus machine-readable output.
---

# Google Business Profile Scorecard

Use this skill when the user asks to audit, score, review, benchmark, or diagnose a local home-service business's Google Business Profile and wants to know **whether the public profile creates trust and enables action**, not how many fields are filled.

The profile is the middle of a larger journey:

```text
LOCAL DISCOVERY → GOOGLE BUSINESS PROFILE → WEBSITE → RESPONSE → BOOKED JOB
```

This skill covers the profile and the handoff. It does not score website usability, Local Pack rank, CRM response time, close rate, or revenue.

## Inputs

| Input | Required | Example |
|---|---|---|
| Business name | Yes | `Example Plumbing` |
| Trade | Yes | `plumbing` |
| City / market | Yes | `Example City, CA` |
| Place ID | Recommended | `ChIJ...` (never a private account ID) |
| Website | When known | `https://example.com` |
| Configuration | Yes for a real audit | `config/market.example.json` |
| Review sample | Recommended | Public reviews, no author PII |
| Audit mode | Yes | `public` |

If the business has no Google Business Profile, say so. Do not invent a score.

## Modes

**Public Mode** (implemented): public Places API data, public profile observation, public review samples, non-destructive destination inspection. No ownership authorization assumed.

**Connected / Authorized Mode** (future): authorized Google Business Profile APIs. Not implemented in V1. Never mix the two, and never let private performance data silently change the public score.

## Pipeline

Run from the repository root.

### 1. Collect

Fixture mode (no credentials, no network):

```sh
npm run collect -- \
  --fixture .opencode/skills/home-service-gbp-audit/scripts/fixtures/acme-plumbing.raw.json \
  --out .audit/acme-plumbing/demo --run-id demo
```

Live public mode:

```sh
export GOOGLE_MAPS_API_KEY="..."
npm run audit -- \
  --business "Example Plumbing" --trade plumbing \
  --city "Example City, CA" --config config/market.example.json
```

The collector writes `.audit/<slug>/<run-id>/audit.json` and `run.json`. It does not post, reply, book, call, text, submit a form, create an account, or change a profile.

The Places API does not expose the complete services list, all attributes, owner responses, posts, or every action type. Review those on the public profile. Absence from the API is not evidence of absence on the profile.

### 2. Review and fill

Copy the worksheet to `reports/<slug>/<run-id>/audit.filled.json`. For every applicable check:

- score from the allowed anchors,
- evidence strings,
- at least one `evidence_refs` source ID,
- `verified` or `strong_signal`,
- configured N/A checks with `score: null`, `confidence: not_applicable`, and a reason.

Record the nine `facts` that drive caps. Facts must restate `profile`, `actions`, and `handoff`; the scorer rejects a conflict.

Use `verified` only for direct observation or safe measurement. Use `strong_signal` when the observation is real but the business consequence is not proven. Owner-data questions are separate.

If a model or external reviewer fills judgment checks, merge the structured proposal with `apply_judgment.mjs`. It accepts only checks whose evaluation is `model_judgment` and requires evidence references.

### 3. Score

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/score.py \
  --input reports/<slug>/<run-id>/audit.filled.json \
  --out reports/<slug>/<run-id>/scores.json \
  --markdown reports/<slug>/<run-id>/scorecard.md --strict
```

The scorer removes N/A checks, normalizes weights, applies five deterministic caps, and writes `scores.json`. It fails on malformed input.

### 4. Render

Create `content.json` with the verdict, three leaks, strengths, fixes, journey summaries, owner-data questions, opportunities, limitations, and next steps. Each leak needs a `checkId` or `ownerDataId`.

```sh
node .opencode/skills/home-service-gbp-audit/scripts/render.mjs \
  --scores reports/<slug>/<run-id>/scores.json \
  --content reports/<slug>/<run-id>/content.json \
  --out reports/<slug>/<run-id>/one-page.md

node .opencode/skills/home-service-gbp-audit/scripts/render.mjs --mode full \
  --scores reports/<slug>/<run-id>/scores.json \
  --content reports/<slug>/<run-id>/content.json \
  --out reports/<slug>/<run-id>/full-report.md
```

### 5. Verify

```sh
node .opencode/skills/home-service-gbp-audit/scripts/verify.mjs \
  --run reports/<slug>/<run-id> \
  --filled reports/<slug>/<run-id>/audit.filled.json \
  --scores reports/<slug>/<run-id>/scores.json \
  --content reports/<slug>/<run-id>/content.json \
  --report reports/<slug>/<run-id>/full-report.md \
  --one-page reports/<slug>/<run-id>/one-page.md \
  --out reports/<slug>/<run-id>/verification.json \
  --mutation --synthetic
```

A run is not delivered unless the verifier exits 0.

## Scoring model

| Category | Weight | Question |
|---|---:|---|
| A. Identity & Accuracy | 15 | Is the business, location, hours, and contact identity coherent? |
| B. Relevance & Service Coverage | 18 | Does the profile communicate the services customers hire it for? |
| C. Conversion & Actionability | 22 | Can a ready customer take a useful next action? |
| D. Reputation & Trust | 20 | Does public reputation provide current, credible proof? |
| E. Content & Freshness | 10 | Does the profile demonstrate active, relevant work? |
| F. Handoff & Journey Continuity | 10 | Does the journey stay coherent outside Google? |
| G. Measurement & Attribution | 5 | Can profile-origin activity be measured? |
| **Total** | **100** | |

Bands: 90–100 A · 75–89 B · 60–74 C · 40–59 D · 0–39 F.

Applicability:

- **Required** — always scored.
- **Conditional** — scored only when its condition is enabled (booking, messaging, emergency, storefront, after-hours, posts).
- **Structural N/A** — no action/destination exists to inspect; the missing action is already scored once.
- N/A checks leave the denominator; category weights are normalized.
- Owner-data questions never reduce the public score.

Five caps:

- `profile_closed` 25 overall
- `no_action_path` 30 overall
- `major_identity_mismatch` 6 / 15 category A
- `primary_site_broken` 4 / 10 category F
- `dead_booking_primary` 10 / 22 category C

Full math: `docs/scoring.md`. Canonical rubric: `references/rubric.json`.

## Evidence rules

1. Evidence or it did not happen.
2. Absent is a finding, not an assumption.
3. Do not confuse "not observed" with "the business does not do this."
4. Do not count the same defect twice.
5. A deterministic check must be `verified`.
6. A model may classify, summarize, or judge clarity. It may not invent a review, link, rating, hour, or action.
7. Owner data is not a failure.
8. Public availability is not publication consent.

## Do not

- Post, reply, book, submit a form, call, text, create an account, or change a GBP.
- Use an authenticated Google session in Public Mode.
- Store credentials, auth headers, cookies, or customer PII in an artifact.
- Publish a real client audit without approval.
- Claim revenue loss from public data.
- Use "best-in-class," "guaranteed," or "revolutionary."
- Let a model choose which RAD service to sell.
- Hand-edit `scores.json` or generated artifacts.

## Reference

- `references/rubric.json` — canonical 49-check rubric
- `references/rubric.md` — generated reference
- `references/coverage-matrix.json` — generated coverage
- `references/portable-checklist.md` — generated external checklist
- `references/fix-library.md` — generated deterministic fixes
- `references/schema/` — audit, raw audit, scores, verification
- `docs/` — public documentation

# Run an audit

There are two paths: the synthetic fixture (no credentials) and a public audit (Places API key required). Start with the fixture.

## Requirements

- Node.js 22+
- Python 3.10+
- git
- A Google Places API (New) key for live collection only

No npm packages are installed at runtime.

```sh
git clone https://github.com/thatguynef/gbp-scorecard.git
cd gbp-scorecard
npm run doctor
npm test
```

## Path 1 — Synthetic fixture

This performs no network access and needs no credential.

```sh
npm run collect -- \
  --fixture .opencode/skills/home-service-gbp-audit/scripts/fixtures/acme-plumbing.raw.json \
  --out .audit/acme-plumbing/demo \
  --run-id demo
```

Output:

```text
.audit/acme-plumbing/demo/audit.json   pending worksheet
.audit/acme-plumbing/demo/run.json     manifest
```

The fixture observations are synthetic. The output is not a scored audit.

## Path 2 — Public audit

Export the key in your shell. Do not create a tracked `.env` file.

```sh
export GOOGLE_MAPS_API_KEY="..."
```

Copy the public configuration and change it for the trade and market. `config/*.json` is gitignored except the example.

```sh
cp config/market.example.json config/my-market.json
```

Run collection:

```sh
npm run audit -- \
  --business "Example Plumbing" \
  --trade plumbing \
  --city "Example City, CA" \
  --config config/my-market.json \
  --slug example-plumbing
```

Or run the collector directly:

```sh
node .opencode/skills/home-service-gbp-audit/scripts/collect.mjs \
  --business "Example Plumbing" \
  --trade plumbing \
  --city "Example City, CA" \
  --state CA \
  --config config/my-market.json
```

Public Mode uses:

- Google Places API (New) for public place data,
- a non-destructive destination inspector,
- public profile review for fields the Places API does not expose.

It never posts, replies, books, calls, texts, submits a form, or changes the profile.

### If the profile has no website

The collector records the absence. Do not invent a destination. The website and handoff checks will be scored from the observed absence or marked N/A where there is no destination to inspect.

### If a destination is unsafe or private

The destination inspector rejects credentials in URLs, localhost, private IPs, and link-local addresses. The run records that the destination was not inspected. Do not bypass this guard to audit a site you do not own.

## Fill the worksheet

The collector writes `audit.json` with 49 pending checks. Copy it to the report package and fill it:

```text
reports/<slug>/<run-id>/audit.filled.json
```

For each check:

- choose a score from `allowed`,
- write the observed evidence,
- add at least one `evidence_refs` source ID,
- use `verified` or `strong_signal`,
- leave configured N/A checks as `applicable: false, score: null, confidence: not_applicable` with a reason.

For each cap fact, record the structured observation. Do not set a cap directly; the scorer derives it from `facts`. Facts must match `profile`, `actions`, and `handoff` or the scorer fails.

The synthetic example is a complete reference:

```text
examples/acme-plumbing/audit.filled.json
```

Do not copy its evidence into a real audit. Use the fields and structure only.

## Score

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/score.py \
  --input reports/<slug>/<run-id>/audit.filled.json \
  --out reports/<slug>/<run-id>/scores.json \
  --markdown reports/<slug>/<run-id>/scorecard.md \
  --strict
```

`--strict` is accepted for pipeline compatibility; validation is always strict. The scorer exits non-zero and writes nothing when the audit is malformed.

## Write content and render

Create `content.json` with:

- verdict,
- three leaks, each linked to a check ID or owner-data ID,
- strengths,
- fixes with check IDs and recoverable points,
- journey summaries,
- owner-data questions,
- opportunity flags,
- limitations,
- next steps.

Then:

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

The renderer rejects an unsupported check ID, a confidence mismatch, a fix that claims more points than are recoverable, or a leak with no structured linkage.

## Verify

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

Use `--synthetic` only for a synthetic or explicitly sanitized example. A real client audit must keep its reports local unless the client has approved publication.

A run is not delivered unless the verifier exits 0.

## Re-render without rescoring

The stages are independent. Change `content.json`, then run the two render commands and verify again. Change a check score only by editing `audit.filled.json`, then rescore. Never hand-edit `scores.json`.

## Clean up

Raw evidence and reports are local:

```text
.audit/
reports/*
```

They are gitignored except `reports/README.md`. Do not force-add them.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `GOOGLE_MAPS_API_KEY is not set` | Live mode without a key | Export the key or use `--fixture` |
| Places request returns 403 | API not enabled, key restricted, or quota | Check the Google Cloud project and key restrictions |
| `facts.X conflicts with the structured observation` | Cap fact edited independently | Restate the actual observation |
| `evidence_refs contains unknown source` | Source ID not in `sources` | Add the source or correct the ref |
| `one-pager word count ... outside` | Report too long or too short | Tighten prose; keep the structured tables |
| Privacy scan fails | A credential, PII, or forbidden path was added | Remove it; rotate any exposed credential |

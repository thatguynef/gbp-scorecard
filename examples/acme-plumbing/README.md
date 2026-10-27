# Acme Plumbing (synthetic)

> **Synthetic example — not a real business.** Every name, URL, phone number, review, and observation is fabricated for documentation and tests.

## Result

**68 / 100 — C (Average).** No cap is active.

| Category | Earned | Applicable | Weight | Normalized |
|---|---:|---:|---:|---:|
| Identity & Accuracy | 13 | 15 | 15 | 13.00 |
| Relevance & Services | 14 | 18 | 18 | 14.00 |
| Conversion & Actionability | 12 | 18 | 22 | 14.67 |
| Reputation & Trust | 12 | 20 | 20 | 12.00 |
| Content & Freshness | 5 | 9 | 10 | 5.56 |
| Handoff & Continuity | 6 | 8 | 10 | 7.50 |
| Measurement | 1 | 3 | 5 | 1.67 |
| **Total** | | | **100** | **68.4** |

Display: **68 / 100 — C (Average)**.

## What the fixture intentionally contains

- one verified conversion problem: no direct booking action (`GBP-CON-03`);
- one strong signal: after-hours demand has no observable next step (`GBP-CON-08`);
- one owner-data question: speed-to-lead (`OD-SPEED-TO-LEAD`);
- N/A checks: messaging, storefront directions, posts, and two structural handoff checks;
- opportunity flags: estimate requests, review automation, attribution, missed-call recovery, emergency routing;
- enough passing checks to produce a realistic middle score.

## Files

| File | Purpose |
|---|---|
| `audit.raw.json` | Collector worksheet before review |
| `audit.filled.json` | Scored audit input |
| `scores.json` | Deterministic score output |
| `content.json` | Report prose and structured linkage |
| `one-page.md` | Contractor-facing report |
| `full-report.md` | Full evidence report |
| `verification.json` | Verifier and mutation-test record |
| `run.json` | Run manifest |

## Reproduce

```sh
npm run verify:example
```

To regenerate the reports:

```sh
npm run render:example
```

Raw observations are synthetic. Do not use this example's evidence as a real audit.

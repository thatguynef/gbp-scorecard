---
description: "How the Local Visibility, GBP, and Website Scorecards fit together without duplicate scoring — ownership boundaries, shared conventions, and published sites."
---

# The Scorecard Family

GBP Scorecard is the profile layer of a three-part diagnostic family. Each score is independently meaningful, and none rewrites another. It is designed to sit beside [Local Visibility Scorecard](https://thatguynef.github.io/local-visibility-scorecard/) and [Website Scorecard](https://thatguynef.github.io/website-scorecard/) without copying their jobs.

## Published scorecards

| Scorecard | Question it answers | Live site |
|---|---|---|
| **Local Visibility** | Can prospective customers discover the business across Search, Maps, AI answers, competitors, and external authority? | [Open Local Visibility](https://thatguynef.github.io/local-visibility-scorecard/) |
| **GBP Scorecard** (this repository) | Does the Google Business Profile create trust and enable action? | [Open GBP Scorecard](https://thatguynef.github.io/gbp-scorecard/) |
| **Website Scorecard** | Can the owned website convert that demand? | [Open Website Scorecard](https://thatguynef.github.io/website-scorecard/) |

Use them in journey order — discovery, profile, website — or run one independently. Do not average the three into a single number.

```text
LOCAL VISIBILITY SCORECARD
Can prospective customers discover the business?
Search · Maps · AI answers · local visibility · competitors
                 ↓

GBP SCORECARD
Does the Google Business Profile create trust and enable action?
Identity · Services · Reviews · Content · Conversion · Handoff
                 ↓

WEBSITE SCORECARD
Can the owned website convert that demand?
UX · Trust · Mobile · Contact · Booking · Measurement
                 ↓

RAD
Remediation and operations live elsewhere.
```

## What is deliberately shared

| Convention | Shared rule |
|---|---|
| Scale | 0–100, seven weighted categories, A–F bands |
| Bands | A 90–100 · B 75–89 · C 60–74 · D 40–59 · F 0–39 |
| Evidence states | `VERIFIED` · `STRONG SIGNAL` · `OWNER DATA REQUIRED` · `NOT APPLICABLE` |
| Public score | Owner-data questions never reduce it |
| N/A handling | N/A checks leave the denominator; weights are renormalized |
| Pipeline | Collect → Review → Score → Render → Verify. Each stage is independently runnable |
| Outputs | `audit.json`, `audit.filled.json`, `scores.json`, `one-page.md`, `full-report.md`, `verification.json` |
| Determinism | Same inputs produce the same score and the same tables |
| Privacy | Raw evidence and client reports stay local; public examples are synthetic or sanitized |
| Visual system | Ink `#0B0B0C`, Surface `#141416`, Card `#1C1C1F`, Paper `#F7F7F5`, Muted `#A6A6AA`, Brand Red `#FF3B3B`, Soft Red `#FF8F8F`, Green `#3FBF7F`, Amber `#F5C766` |
| Voice | Calm, direct, evidence-based. Observed, not observed, may create friction, owner data required |
| Hard caps | Only for revenue-critical failures, each deterministic, tested, and documented |
| RAD boundary | RAD mappings are metadata. The scorecard is useful without RAD |

## What belongs only to GBP Scorecard

- Google Business Profile identity, category, service, hours, and attribute observations.
- Public review recency, velocity, distribution, and owner-response signals.
- Profile media usefulness and freshness.
- Profile action paths: call, website, booking, messaging, directions.
- The Google → destination handoff.
- Profile-origin attribution signals.
- Owner-data questions about calls, messages, bookings, reviews, and profile revenue.

## What belongs only to [Website Scorecard](https://thatguynef.github.io/website-scorecard/)

- Website UX, mobile layout, page speed, accessibility, forms, navigation, and content depth.
- Website conversion paths from the page itself, including form usability and on-site scheduling.
- Website analytics and tag configuration.
- Organic and on-site findability.
- Website-specific hard caps, including broken forms and unreadable mobile layouts.

## What belongs to [Local Visibility Scorecard](https://thatguynef.github.io/local-visibility-scorecard/)

- Local Pack rank and grid visibility.
- Organic ranking and query performance.
- Competitor share of local search.
- AI answer inclusion and citation behavior.
- Local citation consistency outside the profile.
- Paid and organic discovery performance.

## No duplicate scoring

| Question | GBP Scorecard | Website Scorecard | Local Visibility |
|---|---|---|---|
| Primary GBP category quality | SCORE | — | explanatory only |
| GBP service coverage | SCORE | — | explanatory only |
| GBP phone/website/booking action present | SCORE | — | — |
| Website destination resolves | SCORE handoff | — | — |
| Website HTTPS and certificate | SCORE handoff | SCORE | — |
| Website mobile form usability | — | SCORE | — |
| Website page speed | — | SCORE | — |
| Local Pack rank | — | — | SCORE |
| Review recency | SCORE | explanatory only | — |
| Review widget on website | — | SCORE | — |
| Website conversion tracking | — | SCORE | — |
| GBP-origin UTM / source preservation | SCORE | — | — |
| GBP call-click volume | OWNER DATA REQUIRED unless authorized connected data exists | — | — |

The only intentional overlap is HTTPS on the destination. GBP Scorecard judges whether the advertised handoff works; Website Scorecard judges whether the owned site is technically sound. The same defect is not counted twice in one score: a dead destination caps Handoff, not Conversion. See [Scoring](scoring.md).

## Shared artifact and prose conventions

- A public example must carry the word **synthetic** (or **sanitized**) in its report title and footer.
- The one-pager leads with three findings, each labeled with an evidence state.
- The full report separates **Profile Findings**, **Revenue Opportunities to Investigate**, and **Limitations**.
- "Revenue leak" language is allowed only for observable friction. It never asserts lost revenue.
- Recommendations cite canonical check IDs. Deterministic fix mappings choose the recommendation; a model may write prose, not invent services.
- `NOT APPLICABLE` means the check does not apply. It does not mean "unknown," "unavailable," or "the business is bad."

## Deliberate divergence

GBP Scorecard weights **Conversion & Actionability at 22**, because a profile's job is to produce a next step. Website Scorecard weights **Contact at 22** for the same reason on the owned site.

Both scorecards use seven categories so a business owner can compare the shape of the diagnosis, not the underlying checks.

## RAD boundary

The family may eventually feed machine-readable findings into RAD:

```json
{
  "finding": "GBP-CON-03",
  "recommended_modules": ["online_booking"]
}
```

The scoring engines remain separate. RAD consumes findings; it does not merge the rubrics or rewrite a public score with private operational metrics.

## Published sites

- [Local Visibility Scorecard](https://thatguynef.github.io/local-visibility-scorecard/)
- [GBP Scorecard](https://thatguynef.github.io/gbp-scorecard/)
- [Website Scorecard](https://thatguynef.github.io/website-scorecard/)

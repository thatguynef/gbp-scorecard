---
description: "How the GBP Scorecard calculates 0–100: applicability-aware normalization, five deterministic caps, bands, owner-data exclusion, and worked examples."
---

# Scoring

The score answers one question: **how effectively does the observable Google Business Profile support a local customer's journey from discovery to meaningful action?**

It is not a completeness score.

## The formula

For each category with applicable checks:

```text
normalized = category.weight × earned points / applicable points
```

Then:

```text
total = sum(normalized) × 100 / sum(weights of categories with applicable checks)
```

Category caps are applied to `normalized` before the total is computed. Overall caps are applied to the total.

Rounding:

- category normalized values to 2 decimals,
- total and final to 1 decimal,
- display score to the nearest integer using half-up rounding,
- bands use the display score.

## Bands

| Score | Band | Label |
|---:|---|---|
| 90–100 | A | Elite |
| 75–89 | B | Strong |
| 60–74 | C | Average |
| 40–59 | D | Weak |
| 0–39 | F | Critical |

The bands match [Website Scorecard](https://thatguynef.github.io/website-scorecard/) for family consistency.

## N/A normalization

An N/A check leaves both the earned and available points. The category weight is still part of the total, so the remaining checks are renormalized to the category's full weight.

Example:

```text
Category C: 22 points
Applicable checks: 18 points (4 points are N/A)
Earned: 12 points
Normalized C = 22 × 12 / 18 = 14.67
```

A business is not rewarded for having fewer applicable checks. It is scored on the checks that apply.

There are two kinds of N/A:

1. **Configured N/A** — a conditional check is disabled (for example, messaging is not part of the intended contact mix).
2. **Structural N/A** — there is no action or destination to inspect, so a downstream check is excluded. The missing action is already scored by its own check, avoiding a double penalty. For example, if no booking action exists, the booking handoff and booking attribution checks are N/A.

## Owner data

Owner-data questions never enter the denominator and never reduce the public score. They are reported in **Revenue Opportunities to Investigate**.

The score is a **public profile score**. Connected performance diagnostics are separate.

## Hard caps

There are five caps in V1. A cap is exceptional; it exists only where an observable failure can invalidate the rest of the diagnosis.

| Cap | Scope | Cap | Deterministic trigger |
|---|---|---:|---|
| `profile_closed` | Overall | 25 | `profile_status = CLOSED_PERMANENTLY` |
| `no_action_path` | Overall | 30 | phone, website, booking, and other actions are all unusable |
| `major_identity_mismatch` | Category A | 6 / 15 | `identity_consistent = false` |
| `primary_site_broken` | Category F | 4 / 10 | destination state is dead, unrelated, or insecure |
| `dead_booking_primary` | Category C | 10 / 22 | booking is primary and its destination is dead or unrelated |

### Why these five

- **Permanently closed** can stop nearly every action. Temporary closure is a strong signal, not a punitive cap.
- **No action path** means the profile cannot complete its main job.
- **Identity mismatch** makes every other identity signal unreliable.
- **Broken primary site** is a handoff failure and caps Handoff, not Conversion. The same defect is not counted twice.
- **Dead booking as primary action** is worse than no booking action because the customer chose the advertised path and hit a wall.

### Cap application

1. Compute normalized category points.
2. Apply the lowest category cap for that category.
3. Sum normalized points and scale to 100.
4. Apply the lowest active overall cap.
5. Derive the display score and band.

A cap is **active** when its trigger is true and **binding** when it actually lowers the score. The report states both.

Every trigger is a structured fact. Facts must restate observations in `profile`, `actions`, and `handoff`; the scorer rejects a fact that conflicts with the observation. This prevents a cap from being invented independently of the evidence.

## Worked example

The synthetic Acme Plumbing profile:

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

Display: **68 / 100 — C (Average)**. No cap is active.

## Determinism

The same audit and rubric produce the same JSON and the same report tables. The scorer rejects:

- missing checks,
- unknown versions,
- scores outside the allowed set,
- missing evidence,
- unknown evidence sources,
- a deterministic check marked as a strong signal,
- facts that conflict with observations,
- owner-data IDs used as scored checks,
- credential-like strings.

The verifier recomputes the math independently and runs mutation tests.

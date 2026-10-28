---
description: "The four GBP evidence states, source provenance, model judgment rules, and what public profile data can and cannot prove."
---

# Evidence

A finding without evidence is an opinion.

## The four states

### VERIFIED

Directly observed or safely measured.

Examples:

- The public profile has no booking action.
- The website destination returns a 404.
- The rating is 4.6 across 38 reviews.
- The review sample contains no review newer than a known date.
- The destination redirects to an unrelated domain.

A deterministic check must be `verified`. It cannot be a strong signal.

### STRONG SIGNAL

The observation is real, but the business consequence cannot be proven from public data.

Examples:

- After-hours demand has no observable path.
- The first mobile viewport has no visible next action.
- Media is generic enough that it may weaken trust.
- Service descriptions repeat category labels instead of explaining the work.

"Strong signal" is not a softer way to say "we guess." The observation still needs evidence. Only the consequence is uncertain.

### OWNER DATA REQUIRED

The question needs business, CRM, phone, messaging, scheduling, or financial data.

Examples:

- What is the median time from a profile-origin call to first human contact?
- What share of profile-origin booking attempts become jobs?
- Which jobs originated from the profile, and what revenue did they produce?
- Is every completed job asked for a review through the same process?

Owner-data questions are **not scored**. They are reported in **Revenue Opportunities to Investigate**.

### NOT APPLICABLE

The check does not reasonably apply to the business, category, geography, configuration, or audit mode.

Examples:

- A service-area plumber has no storefront, so directions are N/A.
- A painter does not offer emergency service, so the emergency path is N/A.
- Messaging is not part of the intended contact mix.
- A booking handoff does not exist because no booking action exists; the missing action is already scored once.

N/A is not a synonym for "unknown," "unavailable," or "the business is bad." An unavailable source is a **limitation** or an owner-data question, not an automatic N/A.

## Evidence references

Every scored check includes:

- `evidence`: human-readable observations,
- `evidence_refs`: source IDs from `sources`,
- `confidence`: `verified` or `strong_signal`.

The scorer rejects an unknown source ID. The verifier checks that the source exists and that deterministic checks are verified. The report's provenance table lists source type, field completeness, and collection time.

## Model judgment

A model may be used only where judgment is necessary:

- review-theme classification,
- description clarity,
- media usefulness,
- service-coverage interpretation,
- cross-asset consistency,
- suspiciously generic trust signals,
- conversion-friction interpretation.

A model must not be used for deterministic facts:

- link exists,
- link returns 404,
- rating value,
- review count,
- phone exists,
- hours field exists.

Model output is structured and schema-validated. Every judgment needs evidence references. No evidence, no judgment.

The eval harness measures agreement, severity disagreement, evidence citation quality, unsupported claims, and stability. Public eval fixtures are synthetic. See [Model evaluation](eval.md).

## What the public profile cannot prove

- Calls were answered.
- Calls were missed.
- Messages were returned.
- A booking became a job.
- A profile view became revenue.
- The owner's review-request process is consistent.
- The business has capacity.
- The profile's performance trend is improving.

These are not failures. They are owner-data questions.

## Language rules

Use:

- observed / not observed,
- verified finding,
- strong signal,
- owner data required,
- may create conversion friction,
- may be leaking opportunities.

Avoid:

- guaranteed revenue lift,
- this is definitely losing jobs,
- best-in-class,
- revolutionary,
- AI-powered growth engine,
- arbitrary SEO best-practice language.

## Evidence integrity

- One observation, one score.
- Do not count the same defect twice.
- Do not cite a fact that is not in the structured audit.
- Do not invent a review quote, phone number, place ID, or metric.
- Do not treat public availability as publication consent.

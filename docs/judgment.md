---
description: "Structured model judgment proposals for the GBP Scorecard: schema, merger, evidence requirements, and separation from deterministic facts."
---

# Judgment layer

Deterministic facts are not judged. A model is used only where interpretation is unavoidable: review themes, description clarity, media usefulness, service coverage, consistency, and conversion friction.

## Proposal format

A model or reviewer writes a structured proposal:

```json
{
  "schema_version": "1.0",
  "audit_mode": "public",
  "model": {
    "name": "model-or-reviewer",
    "provider": "example",
    "version": "2026-10-27",
    "reviewed_at": "2026-10-27T12:00:00Z"
  },
  "checks": {
    "GBP-SVC-04": {
      "score": 2,
      "confidence": "strong_signal",
      "evidence": [
        "Service descriptions repeat category labels and do not explain the work included."
      ],
      "evidence_refs": ["places", "public_profile"]
    }
  }
}
```

Schema: `.opencode/skills/home-service-gbp-audit/references/schema/judgment-v1.schema.json`.

## Merge

```sh
node .opencode/skills/home-service-gbp-audit/scripts/apply_judgment.mjs \
  --audit reports/<slug>/<run-id>/audit.filled.json \
  --judgment reports/<slug>/<run-id>/judgment.json \
  --out reports/<slug>/<run-id>/audit.reviewed.json \
  --allow-partial
```

The merger:

- accepts only checks with `evaluation = model_judgment`,
- rejects deterministic checks,
- rejects unknown check IDs and owner-data IDs,
- rejects configured N/A checks,
- requires a score from the allowed set,
- requires `verified` or `strong_signal`,
- requires evidence and at least one valid source reference,
- records the reviewer, method, and review time.

Without `--allow-partial`, every applicable judgment check must be present. A production audit should be complete.

## Why no free-form score

A model cannot return "7/10" or a paragraph that the scorer parses. It must return one of the rubric's anchors, with evidence. No evidence, no judgment.

## Relationship to the eval harness

The [eval harness](eval.md) compares pre-collected proposals across models. It does not call a model. The public repository has no live model call in its default test path.

## Deterministic checks

These are never model-judged:

- link exists or returns 404,
- rating value,
- review count,
- phone exists,
- hours field exists,
- destination resolves,
- source parameter exists.

They belong to observation and the collector, not to interpretation.

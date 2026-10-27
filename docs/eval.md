# Model evaluation

Only judgment-dependent checks should be evaluated across models. Deterministic facts are not re-judged.

The eval harness scores **pre-collected** model responses. It does not call a model, which keeps CI offline and the public repository free of live client evidence.

## Mock run

```sh
node .opencode/skills/home-service-gbp-audit/scripts/eval.mjs \
  --snapshot examples/acme-plumbing \
  --mock \
  --out evals/demo/result.json
```

The mock uses the synthetic baseline and intentionally creates one disagreement so the metrics are visible.

## Pre-collected responses

```json
{
  "models": [
    {
      "name": "model-a",
      "checks": {
        "GBP-ID-02": {
          "score": 2,
          "confidence": "verified",
          "evidence_refs": ["places", "destination"]
        }
      }
    }
  ]
}
```

```sh
node .opencode/skills/home-service-gbp-audit/scripts/eval.mjs \
  --snapshot examples/acme-plumbing \
  --responses evals/run.json \
  --out evals/run-result.json
```

## Metrics

| Metric | Meaning |
|---|---|
| Agreement rate | Share of sampled checks where the model score equals the baseline |
| Severity disagreements | Confidence-label differences |
| Evidence citation rate | Responses with at least one valid source reference |
| Unsupported claim rate | Responses with claims that lack a structured evidence reference |
| Hallucinated check IDs | IDs not in the rubric |
| Unstable checks | Score spread greater than 1 across models |

A spread greater than 1 means the anchor is ambiguous. Tighten the rubric text and rerun. A high unsupported-claim rate means the model is writing confidence the evidence does not support.

## What is sampled

`rubric.items` where `evaluation = model_judgment`. Owner-data questions are never sampled. Deterministic checks are facts, not judgments.

## Evals directory

`evals/*` is gitignored except `evals/README.md`. Eval snapshots can contain audit evidence. Keep them local unless every piece is synthetic and intentionally publishable.

## Future adapters

A live adapter can be added later behind an explicit, authorized workflow. It must:

- read credentials from environment variables only,
- separate live calls from CI,
- never publish client evidence,
- validate responses against the same structure,
- preserve the baseline audit for comparison.

The public repository does not include a live model call in its default test path.

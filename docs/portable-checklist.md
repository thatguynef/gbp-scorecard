# Portable checklist

The portable checklist is for a human or an external browser agent collecting public evidence without the repository's scripts. It is generated from the canonical rubric.

Open the generated checklist:

- [`portable-checklist.md`](https://github.com/thatguynef/gbp-scorecard/blob/main/.opencode/skills/home-service-gbp-audit/references/portable-checklist.md)

It contains every check, its anchors, the evidence to capture, and the recommended intervention.

## Rules for an external agent

1. Record the audit mode: **public**.
2. Do not use an authenticated Google session.
3. Do not post, reply, book, submit a form, call, text, or change a profile.
4. Cite evidence for every score.
5. Use `verified` only for direct observation or safe measurement.
6. Use `strong_signal` when the observation is real but the consequence is not proven.
7. Owner-data questions never reduce the public score.
8. Do not invent a field that the public profile does not show.
9. Do not publish a real client audit without approval.

## Minimum evidence set

- Business name, place ID, trade, market, audit timestamp.
- Profile URL and destination URL.
- Primary and additional categories.
- Phone and website actions.
- Address or service-area model.
- Regular hours.
- Services and attributes, if publicly visible.
- Rating, review count, and a recent review sample.
- Media count and useful examples.
- Action destinations and their resolution.
- Source parameters, if visible.

## Output

Return a completed `audit.filled.json` that validates against the schema, then run:

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/score.py --input audit.filled.json --out scores.json --strict
```

Do not hand-write `scores.json`.

## Why a generated checklist

The checklist is tied to the rubric version. If the rubric changes, regenerate it:

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/render_portable.py
```

CI rejects a stale generated checklist.

# Contributing

Thanks for helping improve GBP Scorecard. This is diagnostic infrastructure for local home-service businesses. The goal is not more checks; it is a more credible, reproducible, private, and useful diagnosis.

## Before you start

- Read [The Scorecard Family](docs/scorecard-family.md).
- Read [Evidence](docs/evidence.md) and [Scoring](docs/scoring.md).
- Read [Privacy](docs/privacy.md). Every commit is public.
- Check the issue tracker. A rubric change needs a clear customer-journey reason, not a generic SEO checklist item.

## Development setup

Requirements: Node.js 22+ and Python 3.10+.

```sh
git clone https://github.com/thatguynef/gbp-scorecard.git
cd gbp-scorecard
npm run doctor
npm test
npm run check
```

There are no runtime npm dependencies. Documentation builds need the pinned Python packages in `requirements-docs.txt`.

## Adding or changing a check

1. Edit the canonical rubric: `.opencode/skills/home-service-gbp-audit/references/rubric.json`.
2. Add a canonical ID, category, weight, journey stage, evidence types, applicability, severity, and score anchors.
3. Keep category weights at 100. A check's `max` must fit its category.
4. Map the check to a journey stage and, where appropriate, a fix-library entry.
5. Regenerate derived artifacts:

```sh
python3 .opencode/skills/home-service-gbp-audit/scripts/render_rubric.py
python3 .opencode/skills/home-service-gbp-audit/scripts/render_coverage.py
python3 .opencode/skills/home-service-gbp-audit/scripts/render_portable.py
```

6. Add or update tests, including a fixture that exercises the new anchor.
7. Run the full gate:

```sh
npm run check
npm run verify:example
```

Do not hand-edit generated files. CI rejects stale generated artifacts.

A new check must answer at least one of:

- Can this stop a customer from understanding the business?
- Can this weaken trust?
- Can this prevent a useful action?
- Can this create a dead end?
- Can this reduce service relevance?
- Can this weaken continuity between Google and the destination?
- Can this prevent measurement?
- Can this reveal an important opportunity?

If it only exists because a GBP checklist says so, it does not belong in the scored rubric.

## Hard caps

A hard cap is exceptional. It needs:

- a deterministic trigger represented in structured data,
- a written rationale,
- a unit test,
- fixture coverage,
- documentation.

Do not add a cap for a stylistic issue or an optional opportunity.

## Evidence

- Every scored check needs evidence and a confidence state.
- Use `verified` only for directly observed or safely measured facts.
- Use `strong_signal` when the observation is real but the business consequence cannot be proven.
- Use `owner_data_required` only for unscored owner-data questions.
- Use `not_applicable` only when the check genuinely does not apply. An unavailable data source is not N/A; it is an owner-data or connected-mode limitation.
- Never invent a review quote, a phone number, a place ID, or a performance metric.

## Privacy and security

- Do not commit real client names, customer data, API keys, tokens, cookies, `.env` files, raw API responses, client screenshots, or reports.
- Use `example.com` / `*.example` and `555-01xx` placeholders.
- Run `npm run check:privacy` before committing.
- If you find a leaked credential, stop. See [SECURITY.md](SECURITY.md). Do not open a public issue with the value.

## Pull requests

- Keep the change focused.
- Describe the customer-journey reason and the evidence.
- Include test output.
- Confirm generated artifacts are current.
- Confirm no private data was added.

## Style

- Direct, calm, evidence-based prose.
- Prefer "observed" and "not observed" over absolute claims.
- Do not use "guaranteed," "best-in-class," "revolutionary," or "AI-powered growth engine."
- Use sentence case for headings.
- Use canonical check IDs in recommendations.

## License

By contributing, you agree that your contribution is licensed under the MIT License.

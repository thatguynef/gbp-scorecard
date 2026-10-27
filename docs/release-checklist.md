# Release Checklist

Use this before publishing a release, enabling GitHub Pages, or merging a change that alters the rubric or output.

## Security

- [ ] `npm run check:privacy` passes.
- [ ] `node scripts/privacy_scan.mjs --history` passes.
- [ ] No `.env` file is tracked.
- [ ] No API keys, OAuth secrets, tokens, cookies, session files, or private keys are tracked.
- [ ] No real customer or client PII is tracked.
- [ ] No real-client report, screenshot, raw API response, or private fixture is tracked.
- [ ] Every public example is labeled **synthetic** or **sanitized**.
- [ ] `git status`, `git diff`, `git diff --cached`, and `git ls-files` were inspected by a human.
- [ ] The CI privacy job has run on the final commit.

## Rubric and scoring

- [ ] `references/rubric.json` is the canonical source.
- [ ] Category weights total 100.
- [ ] Every check ID is unique and mapped to a journey stage.
- [ ] Every check has anchors, evidence types, and an applicability rule.
- [ ] Owner-data questions are separate and do not contribute to the score.
- [ ] Opportunity flags are separate from universal penalties.
- [ ] Every hard cap has a deterministic trigger, rationale, test, and fixture coverage.
- [ ] N/A normalization has a test.
- [ ] Generated artifacts are current (`npm run check:generated`).
- [ ] `score.py --strict` passes on the golden fixture.

## Pipeline

- [ ] Collector runs in fixture mode with no external network or credentials.
- [ ] Live mode fails clearly when the API key is absent.
- [ ] Scorer is deterministic.
- [ ] Renderer is deterministic.
- [ ] Verifier passes.
- [ ] Mutation tests fail when an invariant is broken.
- [ ] The synthetic example passes `npm run verify:example`.

## Documentation

- [ ] `npm run docs:build` passes with `--strict` and zero warnings.
- [ ] Relative links pass.
- [ ] Images exist, have alt text, and respect budgets.
- [ ] README explains audience, purpose, framework, privacy, and the run process.
- [ ] `docs/privacy.md` matches actual repository behavior.
- [ ] `docs/scorecard-family.md` states the boundaries with Website Scorecard and Local Visibility Scorecard.
- [ ] The home page can be published without private data.

## GitHub

- [ ] Repository description and topics are set.
- [ ] Branch protection requires CI.
- [ ] Secret scanning and push protection are enabled.
- [ ] Dependabot alerts are enabled.
- [ ] GitHub Pages uses the Docs workflow.
- [ ] The published URL works with no authentication.
- [ ] Private vulnerability reporting is enabled.

## Manual live validation (after the gates above)

- [ ] Use a business where publication is not assumed.
- [ ] Keep all live output under `.audit/` or `reports/`.
- [ ] Do not publish the run.
- [ ] Check API field availability, applicability, false positives, action detection, and cap behavior.
- [ ] Any rubric change is re-tested against the golden fixture and mutation suite.

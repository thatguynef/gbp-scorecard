---
description: "Privacy and public-repository safety for GBP audits: credentials, client reports, PII, evidence paths, and Git history."
---

# Privacy and Public-Repository Safety

> **For:** anyone publishing audit work from this public repository.

This repository is **public**. Treat every tracked file and every commit as internet-public.

## The rules

1. **Raw evidence stays local.** `.audit/`, `raw-api/`, and `audit-screens/` are gitignored. Do not force-add them.
2. **Client reports stay local by default.** `reports/*` is ignored except `reports/README.md`. A report package lives under `reports/<domain>/<run-id>/`.
3. **Client configuration stays local.** `config/*.json` is ignored except `config/market.example.json`.
4. **Never commit credentials.** No `.env` files, API keys, OAuth secrets, access tokens, refresh tokens, service-account JSON, cookies, browser profiles, session stores, private URLs, or production account IDs.
5. **Never commit customer PII.** No customer names, emails, phone numbers, street addresses, review text, call notes, CRM exports, or private messages.
6. **Public availability is not publication consent.** A real GBP is visible to anyone. That does not make it appropriate to publish a real contractor's audit. Default to synthetic or anonymized.
7. **Screenshots can leak.** A screenshot can show an account, a customer name, a phone number, an address, a chat transcript, or a browser profile. Review every image before publishing.
8. **Do not rely on `.gitignore` alone.** Inspect `git status`, `git diff`, `git diff --cached`, and `git ls-files` before every commit.

## What stays local

| Path | Why |
|---|---|
| `.audit/` | Raw public-API responses, destination traces, evidence, and reviewer notes |
| `raw-api/` | Raw Google Places responses that may contain more than the report needs |
| `audit-screens/` | Legacy raw screenshot directory |
| `private-fixtures/` | Confidential test data |
| `reports/*` | Generated client report packages and local indexes |
| `evals/*` | Cross-model eval runs, which can contain client evidence |
| `config/*.json` | Client-specific local configuration; `config/market.example.json` is public |
| `.env`, `.env.*` | Secrets and local configuration |
| Browser profiles, HAR files, cookies | Session data |

These are ignored by default. Do not add exceptions for real client data.

## What may be public

- The rubric, scorer, renderer, verifier, collector, tests, and docs.
- Synthetic fixtures with placeholder names, URLs, phones, addresses, and review text.
- Sanitized examples with only intentionally published public information and no PII.
- Generated artifacts such as `rubric.md`, `coverage-matrix.json`, and `portable-checklist.md`.
- Documentation images generated from synthetic data.

## Credentials

Supply credentials only through environment variables or a local secret manager.

```sh
export GOOGLE_MAPS_API_KEY="..."
npm run collect -- --business "Synthetic Example" --city "Example City, CA" --trade plumbing
```

The collector never loads `.env` automatically. `.env.example` contains variable names only. Never put a real value in a tracked example file.

If a credential appears in a tracked file, a commit, a build log, a screenshot, or a report:

1. Stop.
2. Rotate it vendor-side.
3. Remove it from the current tree.
4. Do not rewrite history without explicit owner authorization.
5. Re-scan history after any authorized rewrite.

## Sanitization checklist

Before publishing an example or fixture:

- [ ] Business name replaced with a synthetic name.
- [ ] URL replaced with `example.com` or `*.example`.
- [ ] Phone numbers replaced with `555-01xx` placeholders.
- [ ] Address replaced with `123 Example St` or omitted.
- [ ] License, bond, and policy numbers replaced with placeholders.
- [ ] Customer names, review quotes, emails, and job details removed or synthesized.
- [ ] Screenshots removed or rebuilt from synthetic data.
- [ ] Analytics IDs, scheduler widget IDs, API keys, and ad account IDs removed.
- [ ] Place ID replaced with an obvious synthetic value.
- [ ] Private notes and internal recommendations removed.
- [ ] The example is labeled **synthetic** or **sanitized**.
- [ ] `git diff --cached` reviewed.
- [ ] `npm run check:privacy` passes.
- [ ] `node scripts/privacy_scan.mjs --history` passes.

## Secret and PII scan

```sh
npm run check:privacy
node scripts/privacy_scan.mjs --history
```

The scan checks tracked and untracked non-ignored files for private-key blocks, common token formats, OAuth secrets, authorization headers, credentials in URLs, `.env` files, forbidden evidence paths, phone-like values, and email-like values. It never prints the detected value.

A hard finding fails the release gate. The scan is a safety net, not a substitute for human review.

## Client-data handling outside the repository

- Store raw evidence in a private local directory or private client workspace.
- Share reports through an agreed private channel.
- Delete raw evidence when it is no longer needed.
- Never paste client data into a public issue, pull request, gist, or example.
- Never use live client evidence in a public eval. Public eval fixtures are synthetic.
- A live audit run is local by default. Publication requires explicit client approval.

## Git history

Removing a file from the current tree does not remove it from Git history. A public repository exposes all reachable history.

If sensitive material is ever committed:

1. Rotate any exposed credential immediately.
2. Decide whether the repository must be made private temporarily.
3. Use a history-rewrite tool only with explicit owner authorization.
4. Back up the repository, coordinate with collaborators, force-push, and require re-clones.
5. Re-run the full privacy scan, including `--history`.

History rewriting is destructive. This project will not do it automatically.

## If you are unsure

Default to **not committing**. A missing example is cheaper than a privacy incident.

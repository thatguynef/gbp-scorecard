# Changelog

All notable changes to GBP Scorecard are documented here. The format follows Keep a Changelog. The project uses semantic versioning for the rubric, schemas, scorer, and collector.

## [1.0.0] — 2026-10-27

### Added

- Public Mode collector for the Google Places API (New) with a fixture-first offline path.
- Non-destructive destination inspector with URL safety checks, timeouts, bounded retries, and bounded response reads.
- Canonical 49-check rubric across seven weighted categories.
- Applicability-aware scoring with N/A normalization and five deterministic hard caps.
- Four evidence states: VERIFIED, STRONG SIGNAL, OWNER DATA REQUIRED, NOT APPLICABLE.
- Versioned JSON Schemas for the raw audit, filled audit, scores, and verification.
- Deterministic scorer, renderer, and independent verifier with mutation tests.
- Synthetic Acme Plumbing example: 68 / 100, one verified conversion finding, one strong signal, one owner-data question, N/A checks, and opportunity flags.
- Generated rubric, coverage matrix, portable checklist, and fix library.
- Privacy scanner for current-tree and Git-history scans, with synthetic secret tests.
- Offline eval harness for judgment-check responses.
- MkDocs documentation site with the scorecard-family visual language.
- CI and Docs workflows designed to run without credentials, live APIs, or model calls.

### Security

- No credentials, auth headers, cookies, customer PII, or private client artifacts in tracked files.
- Automated privacy scan fails on credentials, PII patterns, forbidden evidence paths, and private-client artifacts.
- Scorer and verifier reject credential-like strings in artifacts.

### Known limitations

- Connected / Authorized Mode is not implemented.
- The Places API does not expose the complete GBP profile. Public profile review is required for services, attributes, owner responses, posts, and some action types.
- Mobile usability is judged from destination evidence, not a full browser trace.
- Local Visibility and RAD integration are future work.

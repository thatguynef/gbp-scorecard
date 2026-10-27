# Reports

This directory is for **local** audit reports. It is intentionally ignored by Git except for this README.

A report package lives at:

```text
reports/<domain>/<run-id>/
  audit.filled.json
  scores.json
  scorecard.md
  content.json
  one-page.md
  full-report.md
  verification.json
```

Raw evidence belongs under `.audit/<slug>/<run-id>/`, not here.

## Do not commit

- real client reports,
- screenshots,
- customer names or contact data,
- raw API responses,
- connected-account data,
- private notes.

Only synthetic or explicitly sanitized examples belong in `examples/`. Public availability of a Google Business Profile is not publication consent.

See [docs/privacy.md](../docs/privacy.md).

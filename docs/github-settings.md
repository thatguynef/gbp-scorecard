# GitHub settings

Recommended repository configuration for `thatguynef/gbp-scorecard`.

## About

- **Description:** Evidence-based Google Business Profile scorecard for local home-service businesses.
- **Website:** https://thatguynef.github.io/gbp-scorecard/
- **Topics:** `google-business-profile`, `local-seo`, `home-services`, `audit`, `scorecard`, `conversion`, `revenue-operations`, `open-source`

## Social preview

Upload **`docs/assets/social-preview.png`** as the repository social preview.

- **1200 × 630** px
- **188 KB**
- Opaque PNG
- No client data; synthetic framing only

The source artwork is `docs/assets/social-preview.svg`. The PNG is committed because GitHub expects a raster image, and the text rasterization is intentionally done outside CI so the local font rendering can be reviewed.

## Security

- Enable secret scanning.
- Enable push protection.
- Enable Dependabot alerts and security updates.
- Enable private vulnerability reporting.
- Do not require a public issue for security reports.

## Branches

- Protect `main`.
- Require the CI workflow to pass before merge.
- Require a pull request for changes to `rubric.json`, schemas, scoring, or privacy scripts.
- Do not allow force pushes to `main`.

## Pages

- Settings → Pages → Source: **GitHub Actions**.
- The Docs workflow builds with `mkdocs build --strict` and deploys `site/`.
- No private data is needed to build the site.
- The public site must work without authentication.

## CI

CI must remain offline and credential-free:

- no authenticated Google API requests,
- no personal OAuth credentials,
- no live model calls,
- no form submissions, calls, texts, or bookings,
- no contact with audited businesses.

## Releases

- Tag releases from `main` after the release checklist.
- Include the rubric version, scorer version, and schema version in the notes.
- Keep `CHANGELOG.md` current.

## Discussion and issues

- Use issues for reproducible bugs and rubric proposals.
- Do not post client evidence, credentials, customer PII, or private audit reports.
- A rubric proposal should state the customer-journey question and the evidence.

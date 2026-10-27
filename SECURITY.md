# Security Policy

## Supported versions

The current `1.x` line is supported. There is no legacy line yet. Pre-1.0 tags are not supported.

## Reporting a vulnerability

Please **do not open a public issue** for a live vulnerability, exposed credential, customer-data leak, or exploitable detail.

Use GitHub's private vulnerability reporting for `thatguynef/gbp-scorecard` if it is available. If it is not, contact the maintainer through the GitHub profile associated with the repository and ask for a private channel. Do not include the secret itself in the first message.

Include:

- what is affected,
- how to reproduce it without real customer data,
- the potential impact,
- whether any credential or personal data is exposed,
- a suggested fix if you have one.

## Scope

In scope:

- credential exposure in the repository or Git history,
- customer PII or private client data in tracked files,
- path traversal or unsafe file handling in the scripts,
- command injection or unsafe shell interpolation,
- URL validation bypasses in the collector,
- SSRF or unsafe redirect handling in the destination inspector,
- authorization-header or credential logging,
- generated-output path issues,
- a verifier invariant that can be bypassed,
- a privacy regression in the public examples.

Out of scope:

- findings about a business audited with this tool,
- the accuracy of a third-party Google API response,
- denial-of-service against a site you do not own,
- social engineering,
- requests to audit a business without authorization.

## Security design boundaries

- The collector is read-only. It does not post, reply, change hours, change categories, change services, create bookings, submit forms, send SMS, place calls, or enter payment details.
- Public Mode uses supported public APIs and non-destructive HTTP checks. It does not drive an authenticated Google session.
- Credentials come from environment variables only. They are never written to an audit artifact, cache key, URL, log, report, or exception.
- Every outbound HTTP request has an explicit timeout, a bounded response size, and bounded retries.
- The verifier is file-based. It never re-runs the collector or contacts the business.
- CI uses synthetic fixtures and makes no authenticated Google API request.

## If a credential was committed

1. **Stop.** Do not simply delete the file and continue.
2. Treat the credential as exposed. Rotate or revoke it vendor-side immediately, even if the file is now deleted.
3. Remove it from the current tree.
4. Tell the maintainer privately.
5. Do not assume the history is clean. Removing a file from `HEAD` does not remove it from earlier commits.
6. History rewriting requires explicit owner authorization, a backup, a coordinated force-push, and re-cloning by collaborators.
7. Re-run `node scripts/privacy_scan.mjs --history`.

Deleting a commit is not rotation. Deleting a repository does not revoke a key. Forks, clones, caches, and mirrors may retain the value.

## Non-destructive testing

A security report should not require you to violate the read-only boundary. Use the synthetic fixture and local pages. If you need to test a destination inspector edge case, use a localhost server you control.

## Dependency policy

This repository intentionally has no runtime npm dependencies. Node.js and Python standard libraries are used directly. A new dependency must materially improve security, correctness, or maintainability; it must be pinned, reviewed, and reflected in the release checklist.

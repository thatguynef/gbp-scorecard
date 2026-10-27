# Coverage and completeness

The scorecard is complete when every material question is either **scored**, **diagnosed**, **conditional**, **owner data required**, **observed but unscored**, or **not applicable** — and no material issue is silently ignored or scored twice.

## Journey coverage

| # | Stage | Status | What is covered |
|---:|---|---|---|
| 1 | Identify | Scored | Status, name, primary category, additional categories, phone, website, location model |
| 2 | Understand | Scored | Hours, description, attributes, major services, service priority, emergency coverage, service descriptions, website alignment |
| 3 | Trust | Scored | Rating, count, recency, velocity, distribution, owner responses, service-specific proof, media usefulness |
| 4 | Act | Scored | Phone, website, booking, messaging, directions, mobile handoff, emergency, after-hours, preferred action, conflicts |
| 5 | Handoff | Scored | HTTPS resolution, identity, phone/hours/service consistency, booking destination, dead ends, source context |
| 6 | Response | Owner data | Call answer rate, speed-to-lead |
| 7 | Book | Owner data | Booking conversion |
| 8 | Customer | Owner data | Profile-origin revenue |
| 9 | Review | Owner data | Review request operations |
| 10 | Measure | Scored | Source parameters, booking attribution, destination structure |

The machine-readable matrix is `references/coverage-matrix.json`.

## Cross-scorecard ownership

| Question | GBP Scorecard | Website Scorecard | Local Visibility |
|---|---|---|---|
| GBP category quality | SCORE | — | explanatory only |
| GBP service coverage | SCORE | — | explanatory only |
| GBP phone/website/booking action present | SCORE | — | — |
| Website destination resolves | SCORE handoff | — | — |
| Website HTTPS and certificate | SCORE handoff | SCORE | — |
| Website mobile form usability | — | SCORE | — |
| Website page speed | — | SCORE | — |
| Local Pack rank | — | — | SCORE |
| Review recency | SCORE | explanatory only | — |
| Review widget on website | — | SCORE | — |
| Website conversion tracking | — | SCORE | — |
| GBP-origin UTM / source preservation | SCORE | — | — |
| GBP call-click / direction / booking volume | OWNER DATA REQUIRED or authorized connected diagnostics | — | — |
| Organic ranking and query performance | — | — | SCORE |

The only deliberate overlap is HTTPS at the handoff. GBP Scorecard judges whether the advertised handoff works; Website Scorecard judges whether the owned site is technically sound. A broken destination caps Handoff, not Conversion.

## Not silently ignored

- **Local discovery:** out of scope; assigned to Local Visibility Scorecard.
- **On-site conversion:** out of scope; assigned to Website Scorecard.
- **Response, booking, revenue:** reported as owner data; never scored.
- **Suspicious review patterns:** observed and flagged only when evidence supports it; not a separate scored check in V1.
- **Special hours:** observed when available; represented in the hours check and limitations when the API does not expose it.
- **Services and attributes:** public profile review is required; the Places API does not expose the complete set.
- **Connected performance:** future mode, reported separately.

## Completeness rule

A category is not "complete" because every field is filled. It is complete when every **material customer question** in that category has a state and an evidence basis.

## Known V1 limitations

- Public Mode cannot read the complete GBP profile through the Places API. A reviewer must inspect the public profile for services, attributes, owner responses, posts, and some action types.
- Review samples are not a census.
- Service-area boundaries are not fully exposed by the public API.
- Mobile usability is judged from destination evidence, not a full browser trace in V1.
- Connected performance metrics are not implemented.

# Google Business Profile Scorecard — Acme Plumbing (synthetic)

> **Synthetic example — not a real business.**

**https://acme-plumbing.example/** · Plumbing · Example County, CA · **October 26, 2026**

# 68 / 100 — C (Average)

**A credible profile with a strong local reputation and a usable call path, but it gives a ready customer too few ways to act and no observable after-hours or attribution path.**

---

## Executive summary

- Acme Plumbing has the foundations: a coherent identity, a usable phone path, a correct service-area configuration, and a 4.6 rating across 38 reviews.
- The biggest observable conversion gap is the absence of a booking action, followed by an unexplained after-hours experience.
- Public data cannot show whether calls are answered or how quickly, so speed-to-lead is an owner-data question, not a score penalty.
- The highest-leverage fixes are small: one booking action, one after-hours line, consistent review replies, and one source parameter.

---

## The three biggest revenue leaks

### 1. No direct booking action on the profile

**Stage:** Act
**Check:** GBP-CON-03

**What is happening:** No appointment action is visible. The website has a contact form, not a scheduler.

**Evidence:** The public profile exposes phone and website actions only.

**Why it matters:** A ready customer must leave Google, find a form, and wait instead of booking.

**Fix:** Add one branded, working booking action, or state that booking is by phone.

**Confidence:** VERIFIED

---

### 2. After-hours demand has no observable next step

**Stage:** Act
**Check:** GBP-CON-08

**What is happening:** Hours end at 19:00 with no after-hours policy. The site says to call but does not say who answers.

**Evidence:** No after-hours message or urgent path is visible on the profile or destination.

**Why it matters:** An 8pm emergency cannot tell whether calling reaches anyone.

**Fix:** State the after-hours policy and connect it to one usable path.

**Confidence:** STRONG SIGNAL

---

### 3. Speed-to-lead for profile-origin inquiries is unknown

**Stage:** Response
**Owner data:** OD-SPEED-TO-LEAD · **Not scored**

**What is happening:** Public data shows the action, not what happened after the customer called or clicked.

**Evidence:** Call answer rate, response time, and booking conversion are not public.

**Why it matters:** A booked job depends on a human response, not only a profile action.

**Fix:** Measure median response time for profile-origin leads.

**Confidence:** OWNER DATA REQUIRED

---

## Profile Findings

| ID | Stage | Score | Confidence | What was observed | Fix |
|---|---|---|---|---|---|
| GBP-ID-01 | Identify | 2/2 | VERIFIED | Places API: businessStatus=OPERATIONAL; displayName=Acme Plumbing matches the destination title. | — |
| GBP-ID-02 | Identify | 2/2 | VERIFIED | Places API primaryType=plumber; destination H1 names plumbing repair and drain service. The category is specific and accurate. | — |
| GBP-ID-03 | Identify | 1/2 | STRONG SIGNAL | Places API types include plumber, drainage service, and water heater repair. Drainage is supported by the site; water-heater evidence is thin, so the set is not fully supported. | Remove unsupported categories and keep only services with real delivery evidence. |
| GBP-ID-04 | Identify | 2/2 | VERIFIED | Places API nationalPhoneNumber and destination tel: action both show (555) 010-0200. | — |
| GBP-ID-05 | Identify | 2/2 | VERIFIED | Places API websiteUri points to https://acme-plumbing.example/, the synthetic owned domain used throughout this fixture. | — |
| GBP-ID-06 | Understand | 2/2 | VERIFIED | Public profile and configuration: service-area business, no storefront address, Example County service area. The hidden address is correct, not a defect. | — |
| GBP-ID-07 | Understand | 1/1 | VERIFIED | Places API regularOpeningHours: Mon-Sat 07:00-19:00. The destination publishes the same window. | — |
| GBP-ID-08 | Understand | 1/1 | STRONG SIGNAL | Profile description names repairs, drain cleaning, and Example County, but does not state a customer outcome or differentiator. | — |
| GBP-ID-09 | Understand | 0/1 | VERIFIED | No practical attributes are visible beyond the category labels. | Add verified emergency and service-area attributes. |
| GBP-SVC-01 | Understand | 3/4 | STRONG SIGNAL | Leak detection and repiping are on the website but absent from the profile. | Complete the major service list. |
| GBP-SVC-02 | Understand | 2/3 | STRONG SIGNAL | The profile lists repair work but does not distinguish the highest-value repipe and water-heater jobs. Commercial priority is unclear. | Put the highest-value services first and make them easy to recognize. |
| GBP-SVC-03 | Understand | 3/3 | VERIFIED | Profile description states emergency plumbing service and the preferred call action is present. Urgent work is represented. | — |
| GBP-SVC-04 | Understand | 2/3 | STRONG SIGNAL | Service descriptions repeat category labels; they do not explain the customer problem or the work included. | Write one clear sentence per major service: problem, work, outcome. |
| GBP-SVC-05 | Understand | 2/2 | VERIFIED | Services are grouped as drain cleaning and water heaters. The grouping is scannable, though leak detection is absent. | — |
| GBP-SVC-06 | Understand | 1/2 | VERIFIED | Profile and destination service lists differ on leak detection and repiping. | Align the profile and website service list. |
| GBP-SVC-07 | Understand | 1/1 | STRONG SIGNAL | No category-specific attribute explains emergency availability, financing, or service-area constraints. | — |
| GBP-CON-01 | Act | 4/4 | VERIFIED | Places API phone present and the destination uses a tel: link for the same synthetic number. | — |
| GBP-CON-02 | Act | 2/2 | VERIFIED | Website action is labeled with the business name and points to the synthetic owned domain. | — |
| GBP-CON-03 | Act | 0/3 | VERIFIED | No booking action is present; the destination contact form is not a scheduler. | Add one direct booking action with a branded destination. |
| GBP-CON-04 | Act | N/A | NOT APPLICABLE | N/A: condition not enabled: messaging_expected | — |
| GBP-CON-05 | Act | N/A | NOT APPLICABLE | N/A: condition not enabled: physical_storefront | — |
| GBP-CON-06 | Act | 1/2 | STRONG SIGNAL | The destination is usable at mobile width, but its contact form sits below a large stock hero image. One extra scroll adds friction, not a dead end. | Make the first destination a mobile-usable page owned by the business. |
| GBP-CON-07 | Act | 2/2 | VERIFIED | Emergency service is named and the primary phone action is usable, so an urgent path exists. | — |
| GBP-CON-08 | Act | 0/2 | STRONG SIGNAL | Hours end at 19:00 with no after-hours explanation or path. | State the after-hours policy and connect it to one action. |
| GBP-CON-09 | Act | 2/2 | STRONG SIGNAL | Call is the clearest action; website and estimate request are secondary. The profile does not label a booking path. | — |
| GBP-CON-10 | Act | 1/1 | VERIFIED | Phone and website actions point to the same synthetic business. No conflicting booking or messaging destination is present. | — |
| GBP-TRU-01 | Trust | 3/3 | VERIFIED | Places API rating 4.6 across 38 reviews. This is above the synthetic local baseline for the example. | — |
| GBP-TRU-02 | Trust | 3/3 | VERIFIED | 38 reviews is a plausible base for a service business of this synthetic age and category. | — |
| GBP-TRU-03 | Trust | 3/4 | VERIFIED | The public review sample has no review newer than 2026-07-18. At the 2026-10-27 audit date, recent proof is weak. | Make review requests part of every completed job. |
| GBP-TRU-04 | Trust | 1/3 | VERIFIED | Review timestamps cluster in 2025 and early 2026, then stop. The sample does not show a steady recent cadence. | Use a repeatable post-job request instead of sporadic campaigns. |
| GBP-TRU-05 | Trust | 1/3 | VERIFIED | One 2-star review in January 2026 cites a missed arrival window; the rest of the sample is positive. This is a small but relevant recent negative. | Read recent negatives, fix the recurring cause, and respond publicly where appropriate. |
| GBP-TRU-06 | Trust | 0/2 | VERIFIED | No owner responses are visible despite 38 reviews. | Respond to every review. |
| GBP-TRU-07 | Trust | 0/1 | VERIFIED | No recent relevant owner response is visible. | Write specific replies, starting with the recent negative. |
| GBP-TRU-08 | Trust | 1/1 | STRONG SIGNAL | Two sampled reviews name drain cleaning and water-heater work. Service-specific proof exists but is not repeated across the sample. | — |
| GBP-CNT-01 | Trust | 2/2 | VERIFIED | Places API reports profile and cover media. A logo and cover image are present. | — |
| GBP-CNT-02 | Trust | 1/2 | STRONG SIGNAL | Two of six sampled images are stock graphics. The set is mixed rather than clearly business-specific. | Replace stock imagery with real, permissioned job and team photos. |
| GBP-CNT-03 | Trust | 1/3 | STRONG SIGNAL | One job photo and one team photo are present; service variety is thin relative to the claimed services. | Add captioned photos for each major service, including before/after where appropriate. |
| GBP-CNT-04 | Trust | 0/1 | VERIFIED | Only one recent media item is visible. | Add a small number of recent job photos. |
| GBP-CNT-05 | Trust | 1/1 | VERIFIED | Two images carry business attribution; the remaining images are user-contributed or unattributed. | — |
| GBP-CNT-06 | Trust | N/A | NOT APPLICABLE | N/A: condition not enabled: content_posts_expected | — |
| GBP-HND-01 | Handoff | 2/2 | VERIFIED | Destination fetch resolves over HTTPS with a valid certificate and no unrelated redirect. | — |
| GBP-HND-02 | Handoff | 2/2 | STRONG SIGNAL | Destination title and logo match Acme Plumbing, but the footer uses a shortened brand name. | — |
| GBP-HND-03 | Handoff | 1/2 | VERIFIED | Phone and hours match; the destination adds leak detection not present on the profile. One material service inconsistency. | Update the destination and profile from one source of truth. |
| GBP-HND-04 | Handoff | N/A | NOT APPLICABLE | N/A: not observable: booking_present | — |
| GBP-HND-05 | Handoff | 1/1 | STRONG SIGNAL | The destination has a contact form and phone link, but the first mobile viewport has no visible next action. | — |
| GBP-HND-06 | Handoff | 0/1 | STRONG SIGNAL | The handoff preserves no observable source context. | Preserve one source parameter through the handoff. |
| GBP-MSR-01 | Measure | 0/2 | VERIFIED | The website action has no source parameter. | Add one stable source parameter. |
| GBP-MSR-02 | Measure | N/A | NOT APPLICABLE | N/A: not observable: booking_resolves | — |
| GBP-MSR-03 | Measure | 1/1 | VERIFIED | Destination uses a stable root URL with no redirect chain that would strip query context. | — |

---

## Category breakdown

| Category | Earned | Applicable | Weight | Normalized |
|---|---:|---:|---:|---:|
| A. Identity & Accuracy | 13 | 15 | 15 | 13.00 |
| B. Relevance & Service Coverage | 14 | 18 | 18 | 14.00 |
| C. Conversion & Actionability | 12 | 18 | 22 | 14.67 |
| D. Reputation & Trust | 12 | 20 | 20 | 12.00 |
| E. Content & Freshness | 5 | 9 | 10 | 5.56 |
| F. Handoff & Journey Continuity | 6 | 8 | 10 | 7.50 |
| G. Measurement & Attribution | 1 | 3 | 5 | 1.67 |
| **Total** | **68.4** | **100** | **100** | **68.40** |

_No hard cap is active._

---

## Customer Journey

| Stage | Status | What was observed |
|---|---|---|
| Identify | Scored | The business, phone, website, and service-area model are coherent. |
| Understand | Scored | Plumbing and drain work are clear; one major service and important attributes are missing. |
| Trust | Scored | A strong rating and recent-enough reviews are weakened by no visible owner responses. |
| Act | Scored | Call works; booking is absent; after-hours friction is the main act-stage gap. |
| Handoff | Scored | The website resolves over HTTPS and matches the business; mobile first action and source context are weak. |
| Response | Owner data required | Call answer rate and speed-to-lead are not observable from public data. |
| Book | Owner data required | Booking conversion cannot be measured from the public profile. |
| Customer | Owner data required | Profile-origin revenue and close rate require authorized CRM data. |
| Review | Owner data required | The public result is visible; the request process is not. |
| Measure | Scored | No source parameter distinguishes profile traffic; the destination URL is stable. |

---

## What is already working

- The primary phone is present, usable, and consistent between the profile and the destination.
- The profile resolves over HTTPS and lands on the correct business website.
- The rating is strong at 4.6 across 38 reviews, with service-specific proof in the review sample.
- The service-area configuration is appropriate for a plumbing business without a storefront.

---

## Top fixes

| # | Fix | Checks | Points | Effort |
|---|---|---|---|---|
| 1 | Add one direct booking action with a branded, working destination | GBP-CON-03 | +3 | M |
| 2 | Publish the after-hours policy and connect it to one action | GBP-CON-08 | +2 | S |
| 3 | Respond to every review, starting with the recent negative | GBP-TRU-06, GBP-TRU-07 | +3 | S |
| 4 | Add a consistent source parameter to the profile website action | GBP-MSR-01 | +2 | S |
| 5 | Complete the profile service list and align it with the website | GBP-SVC-01, GBP-SVC-06 | +2 | M |

The booking action and after-hours line remove the two clearest dead ends in the ready-to-act path. Review replies and source attribution make the existing demand visible. None of these fixes requires a new website.

---

## Revenue Opportunities to Investigate

**OWNER DATA REQUIRED — not scored.**

**Call answer rate** (response) — The profile can produce a call, but only the phone system can show whether it was answered.
  - How many profile-origin calls were answered, missed, or abandoned?
  - What is the median ring time and voicemail rate during business hours?

**Speed-to-lead** (Response) — The profile can produce a call or click; only the phone and CRM systems can show how fast a human responds.
  - What is the median time from a profile-origin call or form to first human contact?
  - Does the answer or callback process change after 7pm?

**Booking conversion** (Book) — A booking action would create a path; it would not prove that ready customers complete it.
  - What share of profile-origin booking attempts become scheduled jobs?
  - Where do customers abandon the current contact form?

**Review request operations** (review) — Public reviews show the result, not whether the request process is consistent or selective.
  - Is every completed job asked for a review through the same process?
  - Who owns follow-up, and how are negative experiences handled before a request?

**Profile-origin revenue** (Customer) — Only authorized CRM and financial data can connect profile activity to booked revenue.
  - Which closed jobs originated from the profile?
  - What is the average job value and close rate for profile-origin leads?

---

## Opportunity Flags (not scored)

- **Online estimate requests** (`online_estimates`) — The profile expects a ready customer but offers only a generic website contact form; a scoped estimate path could fit larger jobs.

  Not scored. An optional RAD service is never the reason a business loses points.
- **Review request automation** (`review_automation`) — Reviews are recent enough to trust but owner responses are absent and review velocity is uneven.

  Not scored. An optional RAD service is never the reason a business loses points.
- **Profile-origin attribution** (`advanced_attribution`) — No observable source parameter distinguishes profile traffic from other channels.

  Not scored. An optional RAD service is never the reason a business loses points.
- **Missed-call recovery** (`missed_call_recovery`) — Call is the primary action; owner data is needed to know whether calls are missed.

  Not scored. An optional RAD service is never the reason a business loses points.
- **Emergency routing** (`emergency_routing`) — Emergency plumbing is advertised but after-hours coverage is not explained.

  Not scored. An optional RAD service is never the reason a business loses points.

---

## Limitations

- Public mode cannot observe call answer rate, speed-to-lead, booking conversion, close rate, or revenue.
- The Places API does not expose the complete services list, all attributes, owner responses, posts, or every action type. Those were reviewed from the synthetic public-profile fixture.
- Service-area boundaries are not fully exposed by the public Places API.
- Only a small public review sample was available; theme and recency analysis is illustrative, not a census.
- Connected performance diagnostics are not part of the public score.

---

## Method and provenance

| Source | Type | Field completeness | Collected |
|---|---|---:|---|
| places | places_api | 82% | 2026-10-26T10:01:00Z |
| destination | destination_http | 76% | 2026-10-26T10:04:00Z |
| public_profile | public_profile | 68% | 2026-10-26T10:06:00Z |
| reviews | review_sample | 64% | 2026-10-26T10:07:00Z |
| media | media_sample | 55% | 2026-10-26T10:08:00Z |

**Audit mode:** public · **Rubric:** v1.0.0 · **Collector:** v1.0.0 · **Scorer:** v1.0.0

Public Mode observes only public data. It does not post, reply, book, call, text, submit a form, or change a profile. Owner-data questions are reported separately and never reduce the public score.

---

*Synthetic example for documentation. Not a real business. Prepared with GBP Scorecard v1. · Rubric v1.0.0 · Collector v1.0.0 · Scorer v1.0.0 · Run 2026-10-26T1000-acme*

# Google Business Profile Scorecard — Acme Plumbing (synthetic)

> **Synthetic example — not a real business.**

**https://acme-plumbing.example/** · Plumbing · Example County, CA · **October 26, 2026**

# 68 / 100 — C (Average)



**A credible profile with a strong local reputation and a usable call path, but it gives a ready customer too few ways to act and no observable after-hours or attribution path.**

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

## Score breakdown

| Area | Score |
|---|---|
| Identity & Accuracy | 13.0 / 15 |
| Relevance & Service Coverage | 14.0 / 18 |
| Conversion & Actionability | 14.7 / 22 |
| Reputation & Trust | 12.0 / 20 |
| Content & Freshness | 5.6 / 10 |
| Handoff & Journey Continuity | 7.5 / 10 |
| Measurement & Attribution | 1.7 / 5 |
| **Total** | **68 / 100** |

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

**Call answer rate** (response) — The profile can produce a call, but only the phone system can show whether it was answered.
  - How many profile-origin calls were answered, missed, or abandoned?
  - What is the median ring time and voicemail rate during business hours?

**Speed-to-lead** (Response) — The profile can produce a call or click; only the phone and CRM systems can show how fast a human responds.
  - What is the median time from a profile-origin call or form to first human contact?
  - Does the answer or callback process change after 7pm?

---

## What to do next

1. This week: add a direct booking action or state plainly that booking is by phone, and publish the after-hours policy.
2. Next week: respond to every review, starting with the January 2026 negative, and add a source parameter to the profile website action.
3. Before more ad spend: pull speed-to-lead and profile-origin booking data, then fix the slowest human response step.

---

## Limitations

- Public mode cannot observe call answer rate, speed-to-lead, booking conversion, close rate, or revenue.
- The Places API does not expose the complete services list, all attributes, owner responses, posts, or every action type. Those were reviewed from the synthetic public-profile fixture.
- Service-area boundaries are not fully exposed by the public Places API.

---

*Synthetic example for documentation. Not a real business. Prepared with GBP Scorecard v1. · [Full audit](full-report.md) · Rubric v1.0.0 · Collector v1.0.0 · Scorer v1.0.0 · Run 2026-10-26T1000-acme*

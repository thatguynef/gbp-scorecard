---
description: "Deterministic GBP check-to-fix mappings, priority order, and optional RAD modules. Evidence and score limits stay in the report."
---

# Fix Library

> **Generated from `rubric.json`.** Do not edit by hand. Run `python3 render_fix_library.py`.

The fix library is a deterministic mapping from a failed check to a bounded intervention. It is not a sales menu. A recommendation is evidence-backed only when the corresponding check lost points and the evidence supports the finding.

A RAD module is metadata. The scorecard remains useful without RAD, and the existence of an optional RAD service is never the reason a business loses points.

## Priority order

| Priority | Meaning |
|---|---|
| critical | Can stop a customer from reaching or acting with the business. |
| high | Materially weakens comprehension, trust, or action. |
| medium | Creates friction or ambiguity, but a workaround exists. |
| low | Improves polish or clarity without changing the core path. |

## Check mappings

| Check | Priority | Failure | Fix | Potential RAD modules |
|---|---|---|---|---|
| GBP-CON-01 | critical | Phone action is usable | Make the primary phone tappable everywhere. | `call_tracking` |
| GBP-CON-03 | critical | Booking or appointment action | Add one direct booking action with a relevant destination. | `online_booking` |
| GBP-HND-01 | critical | Website destination resolves over HTTPS | Repair the destination and serve the site over HTTPS. | `conversion_recovery` |
| GBP-HND-04 | critical | Booking destination resolves and belongs to the business | Repair or remove the booking action; use a branded working destination. | `online_booking` |
| GBP-ID-01 | critical | Business status and identity | Confirm operational status and correct the public business name. | `gbp_optimization` |
| GBP-ID-04 | critical | Primary phone is present and coherent | Publish one primary phone and make it tappable and consistent. | `call_tracking` |
| GBP-ID-05 | critical | Website action is present and plausibly owned | Point the website action at the business's own primary domain. | `gbp_optimization` |
| GBP-SVC-01 | critical | Major services are explicit | Name every major service line in the profile. | `gbp_optimization` |
| GBP-TRU-03 | critical | Recent reviews are present | Ask every completed customer for a review through one process. | `review_automation` |
| GBP-CNT-02 | high | Imagery is business-relevant | Replace stock imagery with real, permissioned business photos. | `content_production` |
| GBP-CNT-03 | high | Useful job, team, vehicle, or before/after media | Add captioned photos for each major service, including before/after where appropriate. | `content_production` |
| GBP-CON-02 | high | Website action is clear and labeled | Use a clear website action label and the own primary domain. | `gbp_optimization` |
| GBP-CON-05 | high | Directions or location action | Provide a correct address and directions action for a storefront. | `gbp_optimization` |
| GBP-CON-06 | high | Mobile handoff is compatible | Make the first destination mobile-usable and free of blocking interstitials. | `conversion_recovery` |
| GBP-CON-07 | high | Emergency action pathway | Make one urgent action unmistakable. | `emergency_routing` |
| GBP-CON-09 | high | Preferred next action is clear | Choose one primary action per intent and reduce competing actions. | `conversion_recovery` |
| GBP-HND-02 | high | Destination identity matches the profile | Align the business name, logo, and location across Google and the site. | `gbp_optimization` |
| GBP-HND-03 | high | Phone, hours, and service signals stay consistent | Update the profile and site from one source of truth. | `gbp_optimization` |
| GBP-ID-02 | high | Primary category fits the core business | Choose the most specific accurate primary category. | `gbp_optimization` |
| GBP-ID-06 | high | Location or service-area configuration is coherent | Make the storefront or service-area configuration match the business model. | `gbp_optimization` |
| GBP-ID-07 | high | Regular hours are present and coherent | Publish accurate regular hours and mirror them on the site. | `gbp_optimization` |
| GBP-MSR-02 | high | Booking action carries observable source context | Preserve source context through the booking redirect or form. | `advanced_attribution` |
| GBP-SVC-02 | high | Commercially important services are represented | Prioritize the services the business most wants to sell. | `gbp_optimization` |
| GBP-SVC-03 | high | Emergency or urgent service is represented | State emergency availability and connect it to one urgent action. | `emergency_routing` |
| GBP-SVC-04 | high | Service descriptions are clear | Write one clear problem-work-outcome sentence per service. | `content_production` |
| GBP-SVC-06 | high | Profile services match the website offering | Align profile services with the website offering. | `gbp_optimization` |
| GBP-TRU-01 | high | Rating provides a credible baseline | Investigate recurring causes of low ratings; do not chase a number. | `review_automation` |
| GBP-TRU-02 | high | Review count provides enough context | Build a consistent review-request process. | `review_automation` |
| GBP-TRU-04 | high | Review velocity is consistent | Replace sporadic review campaigns with a repeatable post-job request. | `review_automation` |
| GBP-TRU-05 | high | Recent rating distribution does not signal a trust problem | Read recent negatives, fix the recurring cause, and respond publicly where appropriate. | `review_recovery` |
| GBP-CNT-01 | medium | Profile imagery is present | Add a clear profile image and cover image. | `content_production` |
| GBP-CON-04 | medium | Messaging action | Add one business-owned messaging path with a response expectation. | `sms_messaging` |
| GBP-CON-08 | medium | After-hours path when observable | State the after-hours path and connect it to one action. | `after_hours` |
| GBP-CON-10 | medium | Contact paths do not conflict | Remove stale numbers, domains, and booking destinations. | `gbp_optimization` |
| GBP-HND-05 | medium | No obvious dead end at handoff | Keep one visible next action on the destination that matches the profile promise. | `conversion_recovery` |
| GBP-ID-03 | medium | Additional categories are relevant, not stuffed | Remove unsupported additional categories. | `gbp_optimization` |
| GBP-ID-08 | medium | Description is specific and accurate | Write a specific description around services, customer, and service area. | `content_production` |
| GBP-ID-09 | medium | Relevant attributes support the buying decision | Add verified attributes that answer practical buying questions. | `gbp_optimization` |
| GBP-MSR-01 | medium | Website action carries observable source context | Use one consistent source parameter that survives redirects. | `advanced_attribution` |
| GBP-SVC-05 | medium | Service organization is coherent | Group and order services so a customer can scan them. | `gbp_optimization` |
| GBP-TRU-06 | medium | Owner responses are present | Respond to reviews, especially recent negative ones. | `review_automation` |
| GBP-CNT-04 | low | Media is recent | Add a small number of recent job photos each month. | `content_production` |
| GBP-CNT-05 | low | Business-uploaded context is observable | Upload a current set of owner-provided photos. | `content_production` |
| GBP-CNT-06 | low | Recent posts or updates where applicable | Publish occasional useful job or service updates. | `content_production` |
| GBP-HND-06 | low | Source context is preserved at handoff | Preserve one stable source parameter through the handoff. | `advanced_attribution` |
| GBP-MSR-03 | low | Destination structure allows profile-origin measurement | Use stable landing URLs and avoid redirect chains that strip query context. | `advanced_attribution` |
| GBP-SVC-07 | low | Category-specific attributes add service context | Add category attributes that materially help a customer decide. | `gbp_optimization` |
| GBP-TRU-07 | low | Owner responses are recent and relevant | Write short, specific replies instead of generic acknowledgements. | `review_automation` |
| GBP-TRU-08 | low | Reviews contain service-specific proof | Ask customers to mention the job and result without scripting a fake review. | `review_automation` |

## Opportunity flags

These are never scored. Recommend them only when the evidence and the business model support them.

| Opportunity | RAD module | Why it may matter |
|---|---|---|
| Financing | `financing` | High-ticket trades may lose ready customers who cannot pay the full amount up front. |
| Maintenance plans or memberships | `membership` | Recurring service can increase customer lifetime value. |
| Seasonal maintenance | `maintenance` | Seasonal service can create repeat demand without a new acquisition cost. |
| Emergency routing | `emergency_routing` | Urgent customers need one unmistakable path. |
| Text/SMS path | `sms_messaging` | Some customers will not call. |
| AI or after-hours reception | `ai_receptionist` | Missed after-hours demand can be captured. |
| Online estimate requests | `online_estimates` | Complex jobs may need a scoped estimate before booking. |
| Review request automation | `review_automation` | Consistent requests produce more current proof. |
| Missed-call recovery | `missed_call_recovery` | A missed call is a ready customer. |
| Advanced attribution | `advanced_attribution` | Profile-origin demand should be separable from other channels. |
| Video or job walkthrough | `content_production` | Video can show work quality and team credibility. |
| Enhanced content cadence | `content_production` | Useful updates and recent job media support trust. |

## How to use a mapping

1. Confirm the check is applicable and lost points.
2. Confirm the evidence state: VERIFIED or STRONG SIGNAL.
3. Use the check's recommended intervention, not a generic checklist fix.
4. Keep the report's points claim within the recoverable points.
5. Treat the RAD module as an optional implementation path, not a diagnosis.

## What not to do

- Do not recommend a module merely because it exists.
- Do not claim a revenue lift from a fix.
- Do not bundle unrelated checks into one oversized claim.
- Do not use a model to choose a service; use the deterministic mapping.
- Do not recommend a fix that requires private data the audit does not have.

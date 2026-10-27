# Portable GBP Audit Checklist

> **Generated from `rubric.json`.** Do not edit by hand. This is a collection companion, not a replacement for the scorer.

Rubric v1.0.0 · 49 checks · 100 points

## Before you start

- Record the audit mode: **public**. Do not use an authenticated Google session in Public Mode.
- Record the run timestamp, collector version, business name, place ID, trade, market, and configuration.
- Use only supported APIs or non-destructive public observation. Never post, reply, book, submit a form, call, text, or change a profile.
- Quote or cite evidence for every score. If a fact is not observable, do not invent it.
- Use `verified` only for a directly observed or safely measured fact. Use `strong_signal` when the observation is real but the consequence is not proven.
- Owner-data questions never reduce the public score.

## Evidence states

| State | Use when |
|---|---|
| VERIFIED | Directly observed or safely measured. |
| STRONG SIGNAL | The observation is real, but the business consequence cannot be proven from public data. |
| OWNER DATA REQUIRED | The question needs CRM, call, messaging, scheduling, or financial data. |
| NOT APPLICABLE | The check does not reasonably apply to this business, category, geography, configuration, or mode. |

## 1. Identify

*Is this the right business, in the right place, with a coherent public identity?*

### GBP-ID-01 — Business status and identity (2 pts)

*A closed or misidentified listing cannot serve a customer.* · critical · deterministic

| Score | Anchor |
|---:|---|
| 2 | The profile is operational and the business name matches the trade and destination website. |
| 1 | The profile is temporarily closed, or status/name cannot be verified from available public data. |
| 0 | The profile is marked permanently closed, or the name belongs to a different business. |

**Capture:** businessStatus, displayName, destination title

**If weak:** Confirm the profile status and legal trading name, then correct any mismatch.

### GBP-ID-02 — Primary category fits the core business (2 pts)

*Category is the strongest relevance signal in Maps.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 2 | The primary category accurately names the main service a customer would hire. |
| 1 | The primary category is broader, narrower, or adjacent enough to create ambiguity. |
| 0 | The primary category describes a different business or a service the business does not sell. |

**Capture:** primaryType, website service language

**If weak:** Choose the most specific accurate primary category for the core service.

### GBP-ID-03 — Additional categories are relevant, not stuffed (2 pts)

*Category stuffing dilutes relevance and can mislead customers.* · medium · model_judgment

| Score | Anchor |
|---:|---|
| 2 | Additional categories reflect services the business actually sells and can support. |
| 1 | One or more additional categories are adjacent or weakly supported. |
| 0 | Additional categories are unrelated, duplicated, or clearly used as keyword inventory. |

**Capture:** types, website service pages

**If weak:** Remove unsupported categories and keep only services with real delivery evidence.

### GBP-ID-04 — Primary phone is present and coherent (2 pts)

*A customer must be able to call the business the profile describes.* · critical · deterministic

| Score | Anchor |
|---:|---|
| 2 | A usable primary phone is present and matches the main public phone on the destination. |
| 1 | A phone is present but formatted inconsistently, unverified, or different in one public location. |
| 0 | No phone is present, or the profile phone clearly belongs to another business. |

**Capture:** nationalPhoneNumber, destination tel: links

**If weak:** Use one tracked or primary number and keep it consistent on the profile and site.

### GBP-ID-05 — Website action is present and plausibly owned (2 pts)

*The website action is the primary path to deeper information.* · critical · deterministic

| Score | Anchor |
|---:|---|
| 2 | A website action is present and the domain plausibly belongs to the business. |
| 1 | A website is present but generic, mismatched, or weakly connected to the profile identity. |
| 0 | No website action is present, or it points to an unrelated domain. |

**Capture:** websiteUri, domain, destination title

**If weak:** Point the profile at the business's own primary domain.

## 2. Understand

*Do I understand what this business does, where, when, and for whom?*

### GBP-ID-06 — Location or service-area configuration is coherent (2 pts)

*Service-area businesses should not be penalized for hiding an address.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 2 | A storefront address is coherent, or a service-area business correctly hides its address and communicates a plausible service area. |
| 1 | The location signal is incomplete or ambiguous, without contradicting the business model. |
| 0 | The profile presents a false storefront, a contradictory address, or no usable location signal for a local service. |

**Capture:** formattedAddress, service-area indicators, business configuration

**If weak:** Make the location or service-area configuration match how the business actually sells.

### GBP-ID-07 — Regular hours are present and coherent (1 pts)

*Hours set the expectation for when a customer can reach the business.* · high · deterministic

| Score | Anchor |
|---:|---|
| 1 | Regular hours are present and consistent with the destination. |
| 0 | No regular hours are present, or they contradict the destination. |

**Capture:** regularOpeningHours, destination hours

**If weak:** Publish accurate regular hours and mirror them on the site.

### GBP-ID-08 — Description is specific and accurate (1 pts)

*A specific description helps a customer confirm fit.* · medium · model_judgment

| Score | Anchor |
|---:|---|
| 1 | The description names the services, customer, and local context in plain language. |
| 0 | There is no description, or it makes claims the business cannot support. |

**Capture:** editorialSummary or profile description

**If weak:** Write a short description around services, customer, and service area.

### GBP-ID-09 — Relevant attributes support the buying decision (1 pts)

*Attributes answer practical questions without a click.* · medium · model_judgment

| Score | Anchor |
|---:|---|
| 1 | Relevant attributes are present and consistent with the business. |
| 0 | No relevant attributes are present, or they contradict the service model. |

**Capture:** attributes, accessibility, payment, emergency signals

**If weak:** Add only attributes the business can verify and support.

### GBP-SVC-01 — Major services are explicit (4 pts)

*A customer cannot hire a service they cannot identify.* · critical · model_judgment

| Score | Anchor |
|---:|---|
| 4 | Every major service line the business sells is named clearly in the profile. |
| 3 | Most major service lines are present, but one material line is missing or vague. |
| 1 | Only a generic category is present, or major services are absent. |
| 0 | The profile communicates no usable service coverage. |

**Capture:** services, description, categories

**If weak:** Name the major services in the profile and keep them aligned with the site.

### GBP-SVC-02 — Commercially important services are represented (3 pts)

*Coverage is not the same as commercial clarity.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 3 | The profile highlights the services the business most wants to sell, not just every possible task. |
| 2 | The profile includes the main services but does not distinguish the commercially important ones. |
| 1 | The profile omits the commercially important services or buries them under generic categories. |
| 0 | There is no usable service prioritization. |

**Capture:** services, service order, website service pages

**If weak:** Put the highest-value services first and make them easy to recognize.

### GBP-SVC-03 — Emergency or urgent service is represented (3 pts)

*A customer with an urgent problem needs a fast, explicit path.* · high · deterministic · only if `emergency_service`

| Score | Anchor |
|---:|---|
| 3 | Emergency or urgent service is clearly named and an urgent path is visible. |
| 2 | Urgent service is implied but not clearly named, or the path is incomplete. |
| 1 | The business sells emergency work but the profile does not show an urgent path. |
| 0 | Emergency work is not part of the business, so this check does not apply. |

**Capture:** profile services, 24/7 language, urgent action link

**If weak:** State emergency availability and connect it to one usable urgent action.

### GBP-SVC-04 — Service descriptions are clear (3 pts)

*A service name alone may not answer what the job includes.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 3 | Service descriptions explain the job, the customer problem, and the outcome in plain language. |
| 2 | Descriptions are present but generic, duplicated, or too thin to help. |
| 1 | Service descriptions are absent or are keyword lists with no customer meaning. |
| 0 | The profile has no usable service descriptions. |

**Capture:** service descriptions, profile copy

**If weak:** Write one clear sentence per major service: problem, work, outcome.

### GBP-SVC-05 — Service organization is coherent (2 pts)

*Organization affects whether a customer finds the right service.* · medium · model_judgment

| Score | Anchor |
|---:|---|
| 2 | Services are grouped and ordered in a way a customer can scan. |
| 1 | Services are present but duplication or ordering creates some confusion. |
| 0 | Services are a disorganized list that obscures what the business does. |

**Capture:** service list and order

**If weak:** Group related services and remove duplicates.

### GBP-SVC-06 — Profile services match the website offering (2 pts)

*A mismatch breaks confidence at the handoff.* · high · deterministic

| Score | Anchor |
|---:|---|
| 2 | The profile and destination name the same core services, with no material contradiction. |
| 1 | There is a minor mismatch that does not change the core offer. |
| 0 | A material service mismatch would send a customer to a business that does not sell what the profile promises. |

**Capture:** profile services, website service pages

**If weak:** Align the profile and site service lists, then remove stale services.

### GBP-SVC-07 — Category-specific attributes add service context (1 pts)

*Attributes can answer fit questions at a glance.* · low · model_judgment

| Score | Anchor |
|---:|---|
| 1 | Category-specific attributes clarify the service model (for example emergency, financing, accessibility). |
| 0 | No category-specific context is present, leaving the offer ambiguous. |

**Capture:** category attributes, service model

**If weak:** Add the category attributes that materially help a customer decide.

## 3. Trust

*Does the public reputation and content give me enough confidence to act?*

### GBP-TRU-01 — Rating provides a credible baseline (3 pts)

*Rating is a first-pass trust signal, not a quality proof.* · high · deterministic

| Score | Anchor |
|---:|---|
| 3 | The rating is at or above the local category baseline, or the profile has too few reviews for a rating to be meaningful. |
| 1 | The rating is below the baseline but not severely. |
| 0 | The rating is materially below the local category baseline. |

**Capture:** rating, local category context

**If weak:** Investigate recurring causes of low ratings; do not chase a number.

### GBP-TRU-02 — Review count provides enough context (3 pts)

*Count alone is not quality, but near-zero social proof weakens trust.* · high · deterministic

| Score | Anchor |
|---:|---|
| 3 | The review count is sufficient for the local category and consistent with business age. |
| 1 | The review count is thin but not necessarily a trust failure. |
| 0 | The profile has very few reviews relative to its age or local category. |

**Capture:** userRatingCount, business age when available

**If weak:** Build a consistent review-request process; never buy reviews.

### GBP-TRU-03 — Recent reviews are present (4 pts)

*Recent proof matters more than a historical average.* · critical · deterministic

| Score | Anchor |
|---:|---|
| 4 | A review was published within the recent window expected for the category. |
| 3 | The most recent review is older than expected but within a plausible seasonal window. |
| 1 | The most recent review is stale enough that current trust cannot be inferred. |
| 0 | No reviews are available to assess. |

**Capture:** review publishTime sample

**If weak:** Make review requests part of every completed job.

### GBP-TRU-04 — Review velocity is consistent (3 pts)

*A sudden stop or burst is a signal worth investigating.* · high · deterministic

| Score | Anchor |
|---:|---|
| 3 | Reviews arrive at a reasonably steady rate for the business's job volume. |
| 1 | Review velocity is uneven or slowing, but recent proof exists. |
| 0 | Review acquisition appears to have stopped or occurred in one implausible burst. |

**Capture:** review timestamps

**If weak:** Use a repeatable post-job request instead of sporadic campaigns.

### GBP-TRU-05 — Recent rating distribution does not signal a trust problem (3 pts)

*A historic average can hide a current problem.* · high · deterministic

| Score | Anchor |
|---:|---|
| 3 | Recent ratings are broadly consistent with the overall rating. |
| 1 | There is a modest recent dip or a small cluster of complaints. |
| 0 | Recent one-star reviews or a sharp distribution change suggest an unresolved service problem. |

**Capture:** review ratings, recent sample

**If weak:** Read recent negatives, fix the recurring cause, and respond publicly where appropriate.

### GBP-TRU-06 — Owner responses are present (2 pts)

*A response shows the business is present after the job.* · medium · deterministic

| Score | Anchor |
|---:|---|
| 2 | The owner visibly responds to a meaningful share of reviews. |
| 1 | Some responses are present, but coverage is thin or inconsistent. |
| 0 | No owner responses are observable. |

**Capture:** review responses sample

**If weak:** Respond to reviews, especially recent negative ones, in a calm, specific voice.

### GBP-TRU-07 — Owner responses are recent and relevant (1 pts)

*Generic responses can feel automated and reduce trust.* · low · deterministic

| Score | Anchor |
|---:|---|
| 1 | Responses are recent and address the specific review content. |
| 0 | No recent, relevant owner response is observable. |

**Capture:** response timestamps and text

**If weak:** Write short, specific replies that acknowledge the job and the customer's concern.

### GBP-TRU-08 — Reviews contain service-specific proof (1 pts)

*Specific proof is more credible than a star average.* · low · model_judgment

| Score | Anchor |
|---:|---|
| 1 | Reviews repeatedly mention specific services, jobs, or outcomes. |
| 0 | Reviews are too generic to support the claimed service quality. |

**Capture:** review text sample

**If weak:** Ask satisfied customers to mention the job and the result, without scripting a fake review.

### GBP-CNT-01 — Profile imagery is present (2 pts)

*Imagery is often the first visual trust cue.* · medium · deterministic

| Score | Anchor |
|---:|---|
| 2 | A profile image or cover image is present and usable. |
| 1 | Imagery is present but sparse or low quality. |
| 0 | No usable profile imagery is present. |

**Capture:** photos, profile media

**If weak:** Add a clear cover image and a recognizable profile image.

### GBP-CNT-02 — Imagery is business-relevant (2 pts)

*A real job photo is stronger than a generic graphic.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 2 | Images show the actual business, team, work, vehicles, or job context. |
| 1 | Some relevant images are mixed with generic stock or graphics. |
| 0 | Images are generic, unrelated, or visibly misleading. |

**Capture:** photo sample and captions

**If weak:** Replace stock imagery with real, permissioned job and team photos.

### GBP-CNT-03 — Useful job, team, vehicle, or before/after media (3 pts)

*Useful media demonstrates capability, not just activity.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 3 | The media set shows enough real work variety to support the claimed services. |
| 2 | Some useful media is present, but variety or service coverage is thin. |
| 1 | The media set is too thin or generic to support the claimed work. |
| 0 | There is no useful media to assess. |

**Capture:** photo sample, service list

**If weak:** Add captioned photos for each major service, including before/after where appropriate.

### GBP-CNT-04 — Media is recent (1 pts)

*Recent media suggests the business is active.* · low · deterministic

| Score | Anchor |
|---:|---|
| 1 | New media was added within the recent window expected for the category. |
| 0 | Media appears years old, with no recent proof of activity. |

**Capture:** photo timestamps where available

**If weak:** Add a small number of recent job photos each month.

### GBP-CNT-05 — Business-uploaded context is observable (1 pts)

*Owner media signals intentional presentation.* · low · deterministic

| Score | Anchor |
|---:|---|
| 1 | At least some media is attributable to the business rather than only customers. |
| 0 | Only generic or user-contributed media is visible, with no business context. |

**Capture:** photo attribution metadata

**If weak:** Upload a small, current set of owner-provided photos.

### GBP-CNT-06 — Recent posts or updates where applicable (1 pts)

*Fresh, useful updates can support trust and activity.* · low · deterministic · only if `content_posts_expected`

| Score | Anchor |
|---:|---|
| 1 | A recent post or update is visible and relevant to the service. |
| 0 | Posts are not part of the intended profile strategy, so this check does not apply. |

**Capture:** posts, update timestamps

**If weak:** Publish occasional job or service updates that help a customer, not filler.

## 4. Act

*Can I take a useful next action with minimal friction?*

### GBP-CON-01 — Phone action is usable (4 pts)

*A phone call is the most common high-intent action in home services.* · critical · deterministic

| Score | Anchor |
|---:|---|
| 4 | A tel: action is present, usable on mobile, and the number is not obviously invalid. |
| 3 | A phone action is present but less accessible, inconsistently formatted, or not directly tappable. |
| 1 | A number is shown as plain text only, with no usable call action. |
| 0 | No phone action exists. |

**Capture:** nationalPhoneNumber, tel: link

**If weak:** Publish one primary number and make it tappable everywhere.

### GBP-CON-02 — Website action is clear and labeled (2 pts)

*The action must be recognizable before it is tapped.* · high · deterministic

| Score | Anchor |
|---:|---|
| 2 | The website action is present, clearly labeled, and points to a plausible destination. |
| 1 | The website action is present but weakly labeled or points to a generic page. |
| 0 | No website action is present. |

**Capture:** websiteUri and action label

**If weak:** Use the business's primary website and a clear label.

### GBP-CON-03 — Booking or appointment action (3 pts)

*A ready customer should be able to book without a scavenger hunt.* · critical · deterministic · only if `online_booking_expected`

| Score | Anchor |
|---:|---|
| 3 | A booking action is present, clearly labeled, and resolves to a relevant booking experience. |
| 2 | A booking action is present but indirect, ambiguous, or requires unnecessary steps. |
| 1 | The business expects online booking but offers no visible booking action. |
| 0 | The business does not expect online booking, so this check does not apply. |

**Capture:** booking link, destination state

**If weak:** Add one direct booking action and make the destination relevant.

### GBP-CON-04 — Messaging action (2 pts)

*Some customers will not call; a usable message path captures them.* · medium · deterministic · only if `messaging_expected`

| Score | Anchor |
|---:|---|
| 2 | A messaging action is present, usable, and clearly owned by the business. |
| 1 | Messaging is present but could route to a generic or slow channel. |
| 0 | Messaging is not part of the intended contact mix, so this check does not apply. |

**Capture:** message action, destination state

**If weak:** Add one business-owned messaging path with a clear response expectation.

### GBP-CON-05 — Directions or location action (2 pts)

*A storefront customer needs a reliable way to arrive.* · high · deterministic · only if `physical_storefront`

| Score | Anchor |
|---:|---|
| 2 | A storefront business exposes a coherent directions action and address. |
| 1 | A directions action exists but the address or destination is unclear. |
| 0 | This is a service-area business without a public storefront, so directions are not applicable. |

**Capture:** address, maps link, business configuration

**If weak:** Provide a correct address and directions action.

### GBP-CON-06 — Mobile handoff is compatible (2 pts)

*Most local searches happen on a phone.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 2 | The primary action destinations are usable at mobile width, with no blocking interstitials or app-only dead ends. |
| 1 | One destination has friction that may cause some mobile customers to abandon. |
| 0 | A primary action sends mobile customers to a broken, blocked, or clearly unusable destination. |

**Capture:** destination mobile checks, redirects

**If weak:** Make the first destination a mobile-usable page owned by the business.

### GBP-CON-07 — Emergency action pathway (2 pts)

*Urgency amplifies friction.* · high · deterministic · only if `emergency_service`

| Score | Anchor |
|---:|---|
| 2 | Emergency work is clearly paired with one usable urgent action. |
| 1 | An urgent path exists but is ambiguous or competes with non-urgent actions. |
| 0 | Emergency work is not part of the business, so this check does not apply. |

**Capture:** urgent copy, call or booking path

**If weak:** Make one urgent action unmistakable.

### GBP-CON-08 — After-hours path when observable (2 pts)

*A customer outside business hours still needs a next step.* · medium · model_judgment · only if `after_hours_expected`

| Score | Anchor |
|---:|---|
| 2 | The profile or destination states what happens after hours and offers a usable path. |
| 1 | An after-hours path is mentioned but incomplete or hard to find. |
| 0 | After-hours demand is not expected, so this check does not apply. |

**Capture:** hours, after-hours copy, action links

**If weak:** State after-hours availability and connect it to one action.

### GBP-CON-09 — Preferred next action is clear (2 pts)

*Clarity reduces decision friction.* · high · model_judgment

| Score | Anchor |
|---:|---|
| 2 | One preferred action is clearly dominant and appropriate to the customer's likely intent. |
| 1 | Several actions compete, but a customer can still infer a reasonable next step. |
| 0 | The profile presents no clear preferred action or creates choice paralysis. |

**Capture:** action order, labels, destination copy

**If weak:** Choose one primary action per intent and let the others support it.

### GBP-CON-10 — Contact paths do not conflict (1 pts)

*Conflicting paths create dead ends and distrust.* · medium · deterministic

| Score | Anchor |
|---:|---|
| 1 | Phone, website, booking, and messaging actions point to one coherent business. |
| 0 | Two or more public contact paths conflict in a way that could misdirect a customer. |

**Capture:** phone, website, booking, messaging, destination

**If weak:** Remove stale numbers, domains, and booking destinations.

## 5. Handoff

*Does the journey remain coherent when I leave Google?*

### GBP-HND-01 — Website destination resolves over HTTPS (2 pts)

*A broken handoff loses the customer at the moment of highest intent.* · critical · deterministic · only when `website_present`

| Score | Anchor |
|---:|---|
| 2 | The primary website destination resolves successfully over HTTPS, with a valid certificate and no unrelated redirect. |
| 1 | The destination resolves but has a slow, insecure, or confusing redirect. |
| 0 | The destination is dead, unreachable, or redirects to unrelated content. |

**Capture:** destination fetch, final URL, certificate

**If weak:** Repair the destination and serve the site over HTTPS.

### GBP-HND-02 — Destination identity matches the profile (2 pts)

*Identity continuity is trust continuity.* · high · model_judgment · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 2 | The destination clearly represents the same business name, brand, and location. |
| 1 | The connection is plausible but one identity signal is weak or missing. |
| 0 | The destination appears to belong to a different business or a directory. |

**Capture:** destination title, brand, contact details

**If weak:** Align the business name, logo, and location across Google and the site.

### GBP-HND-03 — Phone, hours, and service signals stay consistent (2 pts)

*Public inconsistency creates hesitation.* · high · deterministic · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 2 | Phone, hours, and core service language match between the profile and destination. |
| 1 | One signal is inconsistent without changing the core offer. |
| 0 | A material inconsistency would make a customer question whether they reached the right business. |

**Capture:** phone, hours, service pages

**If weak:** Update the destination and profile from one source of truth.

### GBP-HND-04 — Booking destination resolves and belongs to the business (2 pts)

*A dead booking link is worse than no booking link.* · critical · deterministic · only if `online_booking_expected` · only when `booking_present`

| Score | Anchor |
|---:|---|
| 2 | The booking destination resolves, is usable, and is clearly branded for the business. |
| 1 | The booking destination works but is generic or requires avoidable steps. |
| 0 | Online booking is not expected, so this check does not apply. |

**Capture:** booking destination state

**If weak:** Repair or remove the booking action; use a branded, working destination.

### GBP-HND-05 — No obvious dead end at handoff (1 pts)

*The handoff must continue the journey.* · medium · model_judgment · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 1 | The destination offers a clear next action appropriate to the profile intent. |
| 0 | The destination is a dead end for the likely intent. |

**Capture:** destination action path

**If weak:** Keep one visible action on the destination that matches the profile promise.

### GBP-HND-06 — Source context is preserved at handoff (1 pts)

*Without source context, profile-driven demand cannot be measured.* · low · model_judgment · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 1 | The handoff preserves useful source context (campaign parameters, booking source, or a coherent landing structure). |
| 0 | The handoff discards all observable source context. |

**Capture:** URL parameters, landing structure

**If weak:** Use a consistent, non-breaking source parameter on profile and booking links.

## 6. Response

*What happens after I call or message, and how fast?*

This stage is not scored from public data. Ask the owner:

- **Call answer rate** (OD-CALL-ANSWER-RATE)
  - How many profile-origin calls were answered, missed, or abandoned?
  - What is the median ring time and voicemail rate during business hours?
- **Speed to lead** (OD-SPEED-TO-LEAD)
  - What is the median time from form, message, or missed call to first human contact?
  - Does the process change after hours?

## 7. Book

*Does a booking request become a scheduled job?*

This stage is not scored from public data. Ask the owner:

- **Booking conversion** (OD-BOOKING-CONVERSION)
  - What share of profile-origin booking attempts become scheduled jobs?
  - Where do customers abandon the booking flow?

## 8. Customer

*Which profile-origin customers became jobs, and what revenue did they produce?*

This stage is not scored from public data. Ask the owner:

- **Profile-origin revenue** (OD-GBP-REVENUE)
  - Which jobs originated from the profile, and what revenue did they produce?
  - What is the close rate and average job value by profile-origin source?

## 9. Review

*Does every completed job feed a consistent review acquisition process?*

This stage is not scored from public data. Ask the owner:

- **Review request operations** (OD-REVIEW-REQUEST)
  - Is every completed job asked for a review through the same process?
  - Who owns follow-up, and how are negative experiences handled before a request?

## 10. Measure

*Can profile-origin activity be distinguished and measured?*

### GBP-MSR-01 — Website action carries observable source context (2 pts)

*Profile-origin demand needs a measurable entry point.* · medium · deterministic · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 2 | The website action includes a stable, non-breaking source parameter that distinguishes profile traffic. |
| 1 | A parameter exists but is inconsistent or likely to be stripped. |
| 0 | No observable source parameter distinguishes profile traffic. |

**Capture:** websiteUri query parameters

**If weak:** Use one consistent source parameter that survives redirects.

### GBP-MSR-02 — Booking action carries observable source context (2 pts)

*A booking that cannot be attributed cannot be evaluated.* · high · deterministic · only if `online_booking_expected` · only when `booking_resolves`

| Score | Anchor |
|---:|---|
| 2 | The booking action carries a source parameter or a booking source field that identifies profile traffic. |
| 1 | Some attribution context exists but is incomplete. |
| 0 | Online booking is not expected, so this check does not apply. |

**Capture:** booking URL parameters, booking form fields

**If weak:** Preserve source context through the booking redirect or form.

### GBP-MSR-03 — Destination structure allows profile-origin measurement (1 pts)

*Attribution should be observable without harming the handoff.* · low · deterministic · only when `website_resolves`

| Score | Anchor |
|---:|---|
| 1 | The destination structure supports clean measurement without breaking the customer experience. |
| 0 | The destination structure prevents meaningful profile-origin measurement. |

**Capture:** landing URL and redirect behavior

**If weak:** Use stable landing URLs and avoid redirect chains that strip query context.

## Owner-data questions

| ID | Stage | Question | Why it matters |
|---|---|---|---|
| OD-CALL-ANSWER-RATE | response | Call answer rate | The profile can produce a call, but only the phone system can show whether it was answered. |
| OD-SPEED-TO-LEAD | response | Speed to lead | Response time affects whether a ready customer books; public data cannot prove it. |
| OD-BOOKING-CONVERSION | book | Booking conversion | A working booking link does not prove a booked job. |
| OD-REVIEW-REQUEST | review | Review request operations | Public reviews show the result, not whether the request process is consistent or selective. |
| OD-GBP-REVENUE | customer | Profile-origin revenue | Only authorized CRM and financial data can connect profile activity to booked revenue. |

## Opportunity flags

These are never scored. Recommend them separately if the evidence supports them.

| Flag | RAD module | Why |
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

# Why this exists

A Google Business Profile can look complete and still fail the customer.

It can have a category, hours, a phone number, a website, and 38 reviews — and still give a ready customer no appointment action, no after-hours path, a broken handoff, or no way to tell whether anyone responds.

Traditional GBP checklists reward field completion. Completeness is easy to count and hard to defend as a business diagnosis. A contractor does not lose a job because the description is 12 characters short. A contractor loses a job when a homeowner cannot tell what the business does, cannot take the next step, does not trust the profile, or never hears back.

## The question

> How effectively does the observable Google Business Profile support a local customer's journey from discovery to meaningful action?

Not:

> How completely was every Google field populated?

## The separation that matters

```text
PUBLIC PROFILE SCORE          REVENUE OPPORTUNITIES TO INVESTIGATE
observable, scored            owner/CRM data, never scored
```

A strong public profile with unknown internal response time should score well **and** produce owner-data questions. It should not be penalized for a CRM it cannot see.

A weak public profile with a great CRM should still be diagnosed as a weak public profile.

## The family

This repository is one engine in a coordinated scorecard family:

```text
LOCAL VISIBILITY SCORECARD   Can customers discover the business?
            ↓
GBP SCORECARD                Does the profile create trust and enable action?
            ↓
WEBSITE SCORECARD            Can the owned site convert the demand?
            ↓
RAD                          Remediation and operations
```

The engines remain separate. A website defect should not be scored twice. A local ranking should not be disguised as a profile defect. RAD consumes findings; it does not rewrite the public score with private operational data.

## What makes this credible

- Every check has a canonical ID, an anchor set, and an evidence type.
- Every scored finding has evidence and a confidence state.
- N/A checks leave the denominator and weights are renormalized.
- Owner-data questions are separate and never reduce the public score.
- Five hard caps are deterministic, documented, and tested.
- The scorer, renderer, and verifier are file-based and reproducible.
- The public example is synthetic.
- Privacy is part of the release gate, not a note at the end.

## What it refuses to do

- Invent a review quote, a field, a call metric, or a revenue outcome.
- Call a business "best-in-class" or claim a guaranteed lift.
- Treat a missing optional service as a universal failure.
- Treat public availability as publication consent.
- Let a model decide which service to sell.
- Mix public and authorized data silently.

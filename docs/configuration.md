# Configuration

Applicability is configuration, not guesswork. A plumbing business and an interior painter do not share the same journey.

## Example

```json
{
  "trade": "plumbing",
  "market": "Example County, CA",
  "service_business": true,
  "online_booking_expected": true,
  "messaging_expected": false,
  "emergency_service": true,
  "physical_storefront": false,
  "after_hours_expected": true,
  "content_posts_expected": false,
  "preferred_actions": ["call", "booking"]
}
```

The public example is `config/market.example.json`. Client-specific files are gitignored except that example.

## Fields

| Field | Type | Effect |
|---|---|---|
| `trade` | string | Must match `business.trade` |
| `market` | string | Must match `business.market` |
| `service_business` | boolean | Documents the service-area model; used in identity judgment |
| `online_booking_expected` | boolean | Enables booking action, booking handoff, and booking attribution |
| `messaging_expected` | boolean | Enables the messaging action |
| `emergency_service` | boolean | Enables emergency service coverage and urgent action checks |
| `physical_storefront` | boolean | Enables the directions action; service-area businesses are N/A |
| `after_hours_expected` | boolean | Enables the after-hours path |
| `content_posts_expected` | boolean | Enables the recent posts check |
| `preferred_actions` | array | Documents intended action priority: `call`, `website`, `booking`, `message`, `directions` |

## Conditional checks

| Condition | Checks |
|---|---|
| `online_booking_expected` | `GBP-CON-03`, `GBP-HND-04`, `GBP-MSR-02` |
| `messaging_expected` | `GBP-CON-04` |
| `emergency_service` | `GBP-SVC-03`, `GBP-CON-07` |
| `physical_storefront` | `GBP-CON-05` |
| `after_hours_expected` | `GBP-CON-08` |
| `content_posts_expected` | `GBP-CNT-06` |

## Structural N/A

Some checks inspect a destination that must exist:

| Requirement | Checks | Behavior when absent |
|---|---|---|
| website present | `GBP-HND-01` | N/A; absence is already scored by website action checks |
| website resolves | `GBP-HND-02`, `GBP-HND-03`, `GBP-HND-05`, `GBP-HND-06`, `GBP-MSR-01`, `GBP-MSR-03` | N/A; the broken handoff is scored by `GBP-HND-01` and capped once |
| booking present | `GBP-HND-04` | N/A; absent booking is scored by `GBP-CON-03` |
| booking resolves | `GBP-MSR-02` | N/A; a dead booking destination is scored by `GBP-HND-04` |

This is deliberate. One missing action should not be penalized four times.

## Choosing applicability

- **Service-area plumber:** `service_business: true`, `physical_storefront: false`, `emergency_service: true`, `after_hours_expected: true`, `online_booking_expected: true` is common.
- **Interior painter:** `emergency_service: false`, `after_hours_expected: false`, `online_booking_expected` depends on the sales process.
- **Garage door:** emergency and same-day work may be expected; verify before enabling.
- **Roofing:** estimates may be the primary action; booking may not be expected.
- **Cleaning:** online booking is often expected; emergency service is not.

Do not enable a condition to make a business look worse. Do not disable one to make it look better. The configuration must describe how the business actually sells.

## Validation

The scorer requires:

- all booleans present,
- `preferred_actions` non-empty,
- `trade` and `market` consistent with the business block.

The collector uses conservative defaults when no configuration is supplied. A real audit should pass a configuration file.

## Connected mode configuration

Connected Mode is not implemented in V1. No OAuth client secret or refresh token is accepted by the public pipeline. The reserved environment variable names are in `.env.example`; they are names only.

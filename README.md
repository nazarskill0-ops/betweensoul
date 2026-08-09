# CouplesScan

An AI relationship test two partners take together from one device. The free
report is generated on submit; the paid deep dive is generated only after
Paddle confirms the payment.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the keys you need
npm run dev
```

With `MOCK_ANALYSIS=1` and `DEV_PAID_BYPASS=1` in `.env.local` the whole flow
runs on canned fixtures — no Claude calls, no Paddle checkout, no keys. Both
flags are ignored in a production build.

## How a purchase works

1. The result page opens Paddle's overlay checkout in the browser
   (`src/lib/paddle.ts`), passing the report id as `customData`.
2. Paddle takes the payment — it is the Merchant of Record, so no card details
   ever reach this app and there is no checkout endpoint here.
3. Paddle posts `transaction.completed` to `/api/webhooks/paddle`. The route
   verifies the signature, pulls `reportId` out of `custom_data`, and queues the
   Sonnet deep dive in `after()` so the webhook returns 200 immediately.
4. The result page polls `GET /api/report/[id]` until `paidStatus` is `ready`.

The browser's own `checkout.completed` event only starts the polling — it never
unlocks anything. The paid sections do not exist server-side until the webhook
has been verified, so there is nothing in an unpaid response to dig out.

## Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes (unless `MOCK_ANALYSIS=1`) | Claude API key. |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | yes | Paddle client-side token. Public. |
| `NEXT_PUBLIC_PADDLE_PRICE_ID` | yes | Price ID (`pri_…`) of the full report. |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | yes | `sandbox` or `production`. Anything else is treated as sandbox. |
| `PADDLE_API_KEY` | yes | Server-side Paddle API key (`pdl_…`). Secret. |
| `PADDLE_WEBHOOK_SECRET` | yes | Signing secret of the webhook destination. Secret. |
| `UPSTASH_REDIS_REST_URL` | yes | Upstash Redis REST endpoint — where reports are stored. |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Upstash Redis REST token. Secret. |
| `MOCK_ANALYSIS` | no | `1` serves canned reports. Dev only. |
| `DEV_PAID_BYPASS` | no | `1` unlocks the paid report without paying. Dev only. |

All five Paddle values must come from the same environment — a sandbox token
with a production price will fail at checkout.

### Paddle setup

- **Client token:** Developer tools → Authentication → Client-side tokens.
- **API key:** Developer tools → Authentication → API keys.
- **Price ID:** Catalog → Products → your product → the price.
- **Webhook:** Developer tools → Notifications → new destination pointing at
  `https://<your-domain>/api/webhooks/paddle`, subscribed to
  `transaction.completed`. Its secret key is `PADDLE_WEBHOOK_SECRET`.

Paddle cannot reach `localhost`, so testing a real sandbox payment end to end
needs a tunnel (e.g. `ngrok`) as the destination URL. The signature check also
rejects anything more than 5 seconds old, so a replayed request body will not
verify.

## Report storage

Reports live in Upstash Redis (`src/lib/reportStore.ts`) under `report:<id>` as
a JSON string, and expire **24 hours** after the test. Every write re-uses the
same absolute expiry, so unlocking a report does not extend how long the answers
are kept. The privacy policy states that window — change one and change the
other.

A second key, `report:<id>:generating`, is set with `NX` for the duration of a
paid generation. That is what stops two concurrent webhook deliveries from both
billing a Sonnet run; it expires by itself after 10 minutes so a killed instance
doesn't wedge the report.

Local dev needs its own Upstash database — the free tier is enough, and the REST
credentials work from localhost.

## Known gaps

- **A buyer's report is gone 24 hours after the test**, paid or not. If people
  start asking for their report back, that TTL is the thing to raise.
- **No analytics.** The privacy policy says so; update it if that changes.

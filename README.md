# CoupleScan

An AI relationship test two partners take together from one device. The free
report is generated on submit; the paid deep dive is generated only after
Paddle confirms the payment.

## The report

Twenty-one sections: **11 free** (couple score, dynamic, an 8-dimension radar,
biggest strength, biggest tension, six sliders, a perception gap, things each
partner may not say, flags, five scenario previews, the question) and **10 paid**
(the full X-ray, every perception gap, the conflict fingerprint, love styles,
how you see each other, if nothing changes, what keeps you together, the
scenario lab, a 7-day reset, and the final synthesis).

Each half is five parallel requests rather than one — eleven sections don't fit
in a single response — grouped so that anything which has to agree with
something else is written together: the radar and the strength/tension drawn
from it, the sliders and the perception gap that read off the same comparisons.
Free runs on Haiku, paid on Sonnet with a Haiku fallback, since a shallower
section beats an error page for someone who has already paid.

Token budgets are per request and measured, not guessed (`src/lib/analysis.ts`,
`src/lib/paidAnalysis.ts`). The X-ray is eight dimensions × four paragraphs and
needs ~4,000 output tokens; at the 3,000 the other sections use, it truncated on
every attempt and took the whole unlock down with it. A response that truncates
anyway is retried at double the budget rather than re-run identically.

Anything with a fixed vocabulary — dimension ids, scenario ids, slider wording,
the list of couple dynamics — lives in `src/lib/types.ts` and is applied by the
validators, so a run that renames or reorders them still lands in the right
slot. Biggest strength and tension are pointed at the actual highest and lowest
radar scores rather than at whichever the model nominated.

### The result page

Free and paid sections are interleaved rather than stacked (`src/app/result/`):
each locked section sits directly after the free one that raises the question it
answers — the X-ray follows the biggest tension, the conflict fingerprint
follows the things each partner doesn't say. The order is fixed in
`page.tsx`; each section is its own component under `components/free` and
`components/paid`.

A locked section shows a real heading and a real teaser over a blurred
structural stand-in — boxes and lines in the shape of the section, never the
analysis, which does not exist in the browser or on the server until the report
is unlocked. Every unlock button on the page opens the same checkout for the
same purchase; the handler rides on context rather than through ten sets of
props.

### Scores

Every prompt carries a calibration block mapping bands to descriptions, because
without it the model parked almost every couple in the 35–55 range. Measured
after: a couple whose answers agree throughout scored 82 overall with a radar
spread of 68–89; one whose answers conflict throughout scored 28 with a spread
of 8–45.

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
   verifies the signature, sets `paid: true` — the only place that ever happens
   — and queues the deep dive in `after()` so the webhook returns 200
   immediately.
4. The result page polls `GET /api/report/[id]`. While `needsUnlock` is true it
   also POSTs once to `/api/report/[id]/unlock`, so a report still gets written
   if the webhook's background run was slow or lost.
5. Both paths go through the same atomic claim, so whichever arrives second
   waits instead of billing a second set of Sonnet requests. `/unlock` refuses
   with 403 unless `paid` is already true, and returns stored sections rather
   than regenerating them.

`POST /api/analyze` is idempotent too: the report id is a hash of the answers
(plus the email, so two couples who pick identical options don't collide), so a
double-tap or a retried request is a lookup instead of another five requests.

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
| `PADDLE_API_KEY` | no | Server-side API key (`pdl_sdbx_apikey_…`). Nothing reads it yet. Secret. |
| `PADDLE_WEBHOOK_SECRET` | yes | Signing secret of the webhook destination (`pdl_ntfset_…`). Secret. |
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
needs a tunnel (e.g. `ngrok`) as the destination URL.

### When the webhook answers 401

The route verifies `Paddle-Signature` itself: HMAC-SHA256 over `<ts>:<raw
body>`, compared as hex, accepting anything signed within five minutes. Every
rejection logs which check failed, and that tells you where to look:

- `signature mismatch` — the secret is wrong. The commonest cause is pasting the
  destination id (`ntfset_…`) instead of its secret key (`pdl_ntfset_…`), or a
  secret from the other Paddle environment.
- `signature expired` — the server clock is off, or a replay.
- `signature malformed` — no `ts`/`h1` in the header; usually a hand-rolled
  request rather than Paddle.

Paddle's own SDK enforces a five-second window, which a cold start can blow
through on a valid delivery; that is why verification here is hand-rolled and
`@paddle/paddle-node-sdk` is not a dependency.

## Rate limiting and cost

`POST /api/analyze` is capped at **5 requests per hour per IP** — a fixed window
counted in Redis under `ratelimit:<ip>` (`src/lib/rateLimit.ts`). The check is
the first thing in the handler, before the body is read, because the point is to
stop five model requests from starting. Over the limit answers 429 with a
`Retry-After`. The IP is the leftmost entry of `x-forwarded-for`; locally that
header is `::1`, so all dev traffic shares one bucket.

If Redis is unreachable the limiter fails **open** and logs it: refusing every
customer is a worse outcome than an unpoliced hour.

Every call to Anthropic is recorded under `usage:<reportId>` — model, section,
token counts, cost, timestamp, and whether it ran on the fallback model
(`src/lib/usage.ts`). It's a Redis list rather than a JSON array under one key,
because the five requests of a pass run concurrently and read-modify-write would
lose entries; `LRANGE usage:<id> 0 -1` still reads back as the array of objects.

Calls are recorded **before** the response is validated, so a truncation or a
refusal — billed, and the runs most worth finding — appear in the log rather
than vanishing from it.

Each pass logs its total when it finishes:

```
[CoupleScan] Report 72fce6a8… — free cost: $0.0177 (Haiku, 5 calls)
[CoupleScan] Report 72fce6a8… — paid cost: $0.1522 (Sonnet, 5 calls)
```

Those are measured, not estimated: **~$0.17 of model spend per fully unlocked
report** against a $9.99 price. The X-ray alone is a third of it. Update
`PRICING` in `src/lib/usage.ts` if the rates change.

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

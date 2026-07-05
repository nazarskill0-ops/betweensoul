# booking/

Slot selection → create booking → pay → confirm. Follow the shape of
`../psychologists/` (schema.ts, api.ts, hooks/, components/).

Touches payments (`@/lib/payments`) and the booking lifecycle in
[../../../docs/DATA_MODEL.md](../../../docs/DATA_MODEL.md). Ask in the chat before
wiring the payment webhook — that part is security-sensitive and handled centrally.

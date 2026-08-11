# Security and Access Document — Digital Alpha

Written in plain English — this is for a non-technical reader as much as an engineer.

## Authentication
This exercise has no login screen and no multi-user accounts — the brief doesn't ask for
auth, so there's one implicit user with one wallet. **In a real product**, the right fit would
be email/password or OAuth (Google) via a managed provider (e.g. Auth0, Clerk, or
Supabase Auth) rather than hand-rolling password storage — session cookies or short-lived JWTs,
refreshed server-side. Flagging this so it's a conscious "not built" choice, not an oversight.

## Roles
Only one role exists right now: **the user** (owns their own transactions, wallet, and
redemption history — implicitly, since there's only one wallet). There's no admin panel and
no staff role in this scope.

If this became multi-user, the roles would be:
| Role | Can | Cannot |
|---|---|---|
| User | View own transactions, redeem own coins | View other users' data, edit transaction history, mint coins directly |
| Admin (future) | Manage rewards catalogue, view aggregate (anonymized) stats | Edit a specific user's balance directly outside the redeem/earn flow |

## Row-level security
Not applicable at single-user scope (there's nothing to isolate between rows). **If extended
to multi-user**: every table that holds user data (`transactions`, `wallet`, `redemptions`)
would get a `user_id` column and a Postgres row-level security policy restricting each query
to `user_id = current_user_id()`, enforced at the database level — not just in application
code — so a bug in the API can't leak another user's rows.

## Error handling guide

| Failure point | What happens | User sees |
|---|---|---|
| Redeem with insufficient balance | API returns 422, no DB change | "Not enough coins for this reward" |
| Redeem for a reward that doesn't exist/is inactive | API returns 404, no DB change | "This reward isn't available" |
| Redeem network/server error mid-request | DB transaction rolls back — balance and redemption history stay in sync | "Something went wrong, your balance is unchanged" — UI reverts any optimistic update |
| Transactions API times out / errors | Table shows an error state, not a blank/stuck loading spinner | "Couldn't load transactions, retry" |
| Malformed data in the seed file (bad amount, unknown status) | Row is skipped and logged at seed time, not silently inserted | N/A (seed-time only) |
| Concurrent redeem requests (double-click, two tabs) | Wallet row is locked (`SELECT ... FOR UPDATE`) during redeem, so requests are serialized — no double-spend | Second request sees the already-updated balance |

## Edge cases to handle before launch
- Empty search/filter results (table shouldn't look broken or identical to "loading")
- A reward priced above the max realistic balance a user could ever reach (dead inventory)
- Refund transactions (negative amounts) — shouldn't earn coins, shouldn't count as "spend" in
  charts, but should still be visible in the table
- Very long merchant names or reward titles breaking table/card layout
- Redeeming down to exactly 0 balance (boundary, not an error)
- Rapid double-submit on the redeem confirm button

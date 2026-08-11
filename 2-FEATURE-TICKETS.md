# Feature Ticket List — Digital Alpha

Each ticket is written to be usable directly as a prompt for an AI coding tool.

---

### TICKET-01: Postgres schema + seed script
**Priority:** Must-have
**Depends on:** none
**Description:** Design a normalized Postgres 18 schema (categories, transactions, wallet,
rewards, redemptions) and a `seed.py` that applies the schema and loads `transactions.json`
in one command, cleaning known data-quality issues (duplicate IDs, string amounts, null/empty
categories, mixed-case status, mixed timestamp formats — negative amounts kept and flagged as
refunds).
**Acceptance criteria:**
- `python seed.py transactions.json` run against a fresh DB creates all tables and loads the
  full dataset with zero unhandled errors.
- Duplicate IDs are deduplicated (first occurrence wins), logged, and not double-inserted.
- Every row has a valid category (falls back to "Uncategorized"), a numeric `amount`, an
  uppercased `status` in `{SUCCESS, FAILED, PENDING}`, and a UTC timestamp.

---

### TICKET-02: Transactions API (server-side filter/search/sort/pagination)
**Priority:** Must-have
**Depends on:** TICKET-01
**Description:** Build a FastAPI endpoint `GET /api/transactions` supporting combinable
filters (category, date range, amount range, status), merchant substring search, sort by
date/amount, and pagination — computed in Postgres, not in Python/browser.
**Acceptance criteria:**
- All filters combine correctly (AND semantics) and can be used together in one request.
- Response includes `items`, `total`, `page`, `page_size`.
- p95 response time stays fast against the full 10k-row table (indexed columns).

---

### TICKET-03: Wallet + rewards + redeem API
**Priority:** Must-have
**Depends on:** TICKET-01
**Description:** Endpoints for coin balance (`GET /api/wallet`), rewards catalogue
(`GET /api/rewards`), and redemption (`POST /api/rewards/redeem`). Redemption must reject an
unaffordable or nonexistent reward with the right status code and never corrupt the balance.
**Acceptance criteria:**
- Redeeming with insufficient balance returns `422` and balance is unchanged.
- Redeeming a nonexistent/inactive reward returns `404`.
- A successful redeem decrements balance and inserts a redemption record atomically (both or
  neither).

---

### TICKET-04: Hand-built transactions table (frontend)
**Priority:** Must-have
**Depends on:** TICKET-02
**Description:** Build the transactions table from scratch in React/TypeScript — no
component-library table. Sticky header, hover/focus states, loading/empty/error states, sort
indicators, responsive down to 360px. Backed by server-side pagination from TICKET-02.
**Acceptance criteria:**
- Renders correctly and stays responsive against the full 10k dataset via paginated requests.
- Keyboard-focusable rows/headers; visible focus states.
- Loading, empty-result, and error states are all implemented and visually distinct.
- Row click opens a detail drawer/modal.

---

### TICKET-05: Filter/search/sort controls
**Priority:** Must-have
**Depends on:** TICKET-04
**Description:** UI controls wired to the API's filter params — category select, date range
picker, amount range inputs, status filter, merchant search-as-you-type (debounced), sortable
column headers.
**Acceptance criteria:**
- Changing any filter re-queries the API and updates the table without a full page reload.
- Filters are combinable and reflected in the UI (e.g. active filter chips).
- Search is debounced (no request-per-keystroke).

---

### TICKET-06: Spend by category chart
**Priority:** Must-have
**Depends on:** TICKET-02
**Description:** Chart (Recharts) showing spend totals by category, sourced from
`GET /api/transactions/analytics/by-category`. Clicking a slice filters the transactions table
to that category.
**Acceptance criteria:**
- Chart renders against the full dataset's aggregated totals (not client-side aggregation of
  10k rows).
- Clicking a category slice updates the table's active category filter.

---

### TICKET-07: Monthly spend trend chart
**Priority:** Should-have
**Depends on:** TICKET-02
**Description:** Line/bar chart of spend by month, sourced from
`GET /api/transactions/analytics/monthly-trend`.
**Acceptance criteria:** Renders correctly across the full date range in the dataset;
responsive at narrow widths.

---

### TICKET-08: Coin balance + rewards redeem UI
**Priority:** Must-have
**Depends on:** TICKET-03
**Description:** Persistent visible coin balance, rewards catalogue grid, select → confirm →
done redeem flow. On API failure, UI must recover cleanly (no stuck "confirming" state, no
silently wrong balance shown).
**Acceptance criteria:**
- Balance is visible from any dashboard view.
- Failed redeem shows an error and reverts any optimistic UI change.
- Successful redeem updates balance and shows confirmation.

---

### TICKET-09: Two-way chart-table cross-filtering
**Priority:** Nice-to-have
**Depends on:** TICKET-05, TICKET-06, TICKET-07
**Description:** Table filter changes also reshape both charts, not just chart→table.
**Acceptance criteria:** Applying a table filter (e.g. date range) updates both charts to
reflect only the filtered set.

---

### TICKET-10: Deployment
**Priority:** Must-have (or demo video as fallback)
**Depends on:** all above
**Description:** Deploy frontend (Vercel/Netlify), backend (Render/Railway/Fly), and Postgres
(Neon/Supabase/Railway). If time runs out, record a screen-capture walkthrough instead.
**Acceptance criteria:** A reviewer can open a live URL and use the full app, or watch a video
covering all must-have features.

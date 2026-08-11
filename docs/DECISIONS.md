# Technical Decisions Document — Digital Alpha

This document captures the key architectural, database, frontend, and backend decisions made during development, along with the reasoning and tradeoffs.

---

## 1. Database Architecture: PostgreSQL 18 & Normalized Relational Model

- **Decision:** Full relational PostgreSQL schema (`categories`, `transactions`, `wallet`, `rewards`, `redemptions`) with foreign keys, index structures, and check constraints (`coin_balance >= 0`).
- **Why over single-table / JSON store:**
  - Fast index-accelerated B-Tree searches on `merchant`, `category_id`, `status`, `occurred_at`, and `amount`.
  - Native atomic transactions (`SELECT ... FOR UPDATE`) preventing race conditions and double-spending during redemptions.
  - Zero application memory overhead for analytics aggregations (`SUM(amount)` grouped by category or month computed in the query planner).
- **Multi-environment compatibility:** Uses SQLAlchemy ORM/Core so the application seamlessly connects to PostgreSQL in production (`DATABASE_URL=postgresql://...`) and falls back to SQLite in lightweight development environments without changing schema or business logic.

---

## 2. Server-Side Pagination vs. Virtualization

- **Decision:** Server-Side Pagination with configurable page sizes (25, 50, 100).
- **Why over client-side Virtualization:**
  - **Bandwidth & Memory:** Streaming 10,000 JSON records (~2.5 MB uncompressed) on initial page load increases First Contentful Paint (FCP) and consumes mobile RAM.
  - **Scale:** Server-side pagination scales to 1,000,000+ records with constant memory footprint on the client.
  - **Performance:** Combined with database indexing, queries return in <10ms for each page.

---

## 3. Frontend: Next.js 14 App Router + TypeScript & Zero Component Library for Table

- **Decision:** React 18 / Next.js with TypeScript. Built a custom, fully hand-crafted table using native semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`), CSS variables (design tokens), sticky headers, custom keyboard navigation, and responsive card-collapse for mobile (<360px).
- **Why no component library (MUI, Chakra, shadcn):**
  - Strict compliance with the assignment constraint.
  - Full control over pixel perfection, hover/focus states, smooth rendering, accessibility (`aria-sort`, `role="region"`), and bundle size.

---

## 4. State Management & Filtering Architecture

- **Decision:** React standard hooks (`useState`, `useCallback`, `useMemo`, custom hooks) combined with debounced search.
- **Why:** No heavy external state management library (like Redux) is needed for a single dashboard. Filter state is centralized and synchronizes bidirectionally:
  - Table filters update the transactions table and can optionally reshape charts.
  - Chart slice clicks instantly set the active category filter in the table.

---

## 5. Concurrency & Atomic Redemptions

- **Decision:** Strict database row locking on the `wallet` table during redemption (`SELECT ... FOR UPDATE`), followed by atomic deduction and redemption logging within the same database transaction.
- **Why:** Protects against rapid double-clicks, network replay, and concurrent requests across multiple tabs or devices. Returns proper HTTP status codes:
  - `404 Not Found`: Reward doesn't exist or is inactive.
  - `422 Unprocessable Entity`: Insufficient coin balance.
  - `200 OK`: Redemption succeeded with updated balance and transaction receipt.

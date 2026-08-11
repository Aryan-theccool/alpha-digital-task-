# AI Usage & Transparency Report — Digital Alpha

In accordance with the assignment requirements, this document outlines how AI tools were utilized during development, what parts were generated, and real examples of AI output that were rejected, rewritten, or corrected.

---

## 1. AI Tools Utilized
- **AI Coding Agent (Arena.ai / Claude 3.7 Sonnet):** Used for project scaffolding, drafting TypeScript interfaces, generating initial SQL schema definitions, and writing test cases.

---

## 2. Where AI Was Used
1. **Scaffolding & Boilerplate:** Creating standard Next.js configuration, FastAPI folder structure, and Pydantic request/response models.
2. **Data Cleansing Scripts:** Writing the regex and parsing functions for multi-format timestamps (ISO 8601 vs Unix millisecond integers) and numeric amount conversions in `seed.py`.
3. **Design Tokens & CSS Variables:** Translating the frontend specification tokens into `--color-*`, `--space-*`, and `--radius-*` CSS rules.

---

## 3. Real Examples of AI Output Thrown Away / Fixed

### Example 1: Client-Side Pagination with Full Array Slicing
- **AI Output:** The initial generated code suggested loading all 10,000 transactions into a React state array (`const [allTransactions, setAllTransactions] = useState([])`) and doing `.filter()` and `.slice(page * limit, (page + 1) * limit)` in the browser.
- **Why it was thrown away:**
  - Violates the core performance principle of the brief.
  - Initial payload would be over 2.5 MB, causing noticeable UI jank and memory spikes on lower-end devices.
  - Fails the requirement of "Postgres with a schema and server-side filtering/sorting/pagination".
- **Fix:** Completely redesigned the API to accept `GET /api/transactions?category=...&search=...&sort_by=...&page=1&page_size=25` and executed the SQL queries directly with `LIMIT`, `OFFSET`, and `COUNT(*) OVER()`.

### Example 2: Insecure Non-Atomic Reward Redemption (Race Condition)
- **AI Output:** The generated redemption logic read the user balance with `wallet = db.query(Wallet).first()`, checked `if wallet.coin_balance >= cost:`, and then in a separate step did `wallet.coin_balance -= cost; db.commit()`.
- **Why it was thrown away:**
  - Vulnerable to TOCTOU (Time-of-Check to Time-of-Wait) race condition: two simultaneous requests could both read the same initial balance and double-spend coins into negative balance.
- **Fix:** Implemented `db.query(Wallet).with_for_update().first()` within a strict single transaction block, plus added a PostgreSQL database-level `CHECK (coin_balance >= 0)` constraint so invalid balances are rejected at the database engine level.

### Example 3: Chart Slice Interaction Replacing All Other Filters
- **AI Output:** Clicking a category slice in the pie chart reset all existing date and amount filters, overriding the user's state.
- **Why it was fixed:**
  - Destroyed user context if they were already filtering by a specific date range or status.
- **Fix:** Updated the filter state handler to immutably merge the category filter with active date, amount, and status filters, preserving full user context and allowing seamless cross-filtering.

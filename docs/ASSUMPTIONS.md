# Assumptions Document — Digital Alpha

This document outlines the key product, architectural, and business assumptions made during the design and implementation of the Digital Alpha platform, where the assignment brief left room for interpretation.

---

### 1. Single User & Implicit Wallet Scope
- **Assumption:** Since multi-user authentication was not required in v1, all transactions and coin earnings belong to a single global consumer profile/wallet.
- **Rationale:** Keeps the MVP focused on high-performance data operations (10k-row filtering/sorting, complex charts, atomic redemptions) rather than auth boilerplate.
- **Future Extension:** The schema and services are architected with clean boundaries so adding `user_id` foreign keys and PostgreSQL Row-Level Security (RLS) is straightforward.

---

### 2. Coin Earning & Cap Logic
- **Assumption:** 
  - 1 coin is earned for every **₹100 spent** on transactions with `status = 'SUCCESS'`.
  - Earnings are capped at a maximum of **50 coins per transaction** (to mirror real-world credit-card reward schemes that prevent gaming on outlier high-value transactions).
  - Failed (`FAILED`), Pending (`PENDING`), and Refund transactions (`amount < 0`) **do not earn coins**.
- **Rationale:** Protects reward economics and aligns with the brief's requirement of "one coin per ₹100 spent, capped per transaction."

---

### 3. Handling Data Anomalies & Refunds
- **Assumption:**
  - **Negative Amounts:** Treated as valid refunds/chargebacks. They are stored in the database with `is_refund = TRUE`, displayed in the transactions table with a negative badge/styling, but excluded from positive spending totals in spend analytics charts.
  - **Duplicate IDs:** If a transaction ID appears more than once in the dataset, the first occurrence is preserved as canonical and subsequent duplicates are logged and skipped during ingestion.
  - **Category Normalization:** Missing, empty (`""`), or `"None"` categories default to `"Uncategorized"`.
  - **Status Normalization:** Mixed-cased statuses (e.g. `'success'`) are normalized to standard uppercase values (`'SUCCESS'`, `'FAILED'`, `'PENDING'`).
  - **Timestamp Formats:** Both ISO 8601 strings and Unix millisecond timestamps are parsed into standardized UTC `TIMESTAMPTZ`.

---

### 4. Rewards Catalogue & Economics
- **Assumption:** A curated set of 6 realistic consumer rewards (shopping vouchers, food & dining discounts, travel credits, and cashback) with costs ranging from 100 to 1,500 coins.
- **Rationale:** Provides immediate tangible utility across low, medium, and high coin balances.

---

### 5. Server-Side Execution Model
- **Assumption:** All filtering, sorting, pagination, and analytics aggregations are executed directly inside PostgreSQL via indexed SQL queries, rather than streaming all 10,000 records to the browser.
- **Rationale:** Ensures 60fps UI performance, sub-50ms latency, and minimal network payload transfer, scaling gracefully to millions of rows.

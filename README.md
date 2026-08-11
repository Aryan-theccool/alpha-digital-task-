# Digital Alpha · Transactions, Spend Analytics & Rewards Ledger

A production-grade full-stack consumer application for managing credit-card bill payments, exploring personal spending patterns across categories and monthly trends, and earning & redeeming coin rewards on successful payments.

Built with **Next.js 14 (App Router)**, **TypeScript**, **FastAPI (Python)**, and **PostgreSQL 18** with an index-optimized relational schema and ACID-compliant atomic coin redemptions.

---

## ✨ Features

### 1. High-Performance Transactions Dashboard (10,000 Dataset)
- **Zero Component Library Table:** Built 100% from scratch using semantic HTML and custom CSS design tokens (no MUI, Ant, Chakra, or shadcn).
- **Sticky Header & Fixed Layout:** Table header stays anchored while scrolling through records.
- **Server-Side Execution:** Fast pagination (25, 50, 100 per page), sorting by Date and Amount (ASC/DESC), and multi-field filtering computed directly in PostgreSQL.
- **Debounced Search:** Substring search on merchant names with 300ms debouncing.
- **Combinable Filters:** Filter by category, payment status (`SUCCESS`, `FAILED`, `PENDING`), payment mode (`Credit Card`, `Debit Card`, `UPI`, `Netbanking`), amount range (min/max), and date range (start/end).
- **Accessible Interaction:** Keyboard navigation (`Tab`, `Enter`, `Space`), focus-visible outlines, loading skeleton shimmers, empty state, and error retry state.
- **Hand-Crafted Transaction Detail Modal:** Focus trap, `Escape` key to close, backdrop click dismiss, displaying ledger metadata, date/time, and coin earnings.
- **Responsive Down to 360px:** Responsive design with automatic column prioritization on mobile viewports.

### 2. Spend Analytics & Bidirectional Cross-Filtering
- **Category Breakdown Donut Chart:** Interactive Recharts distribution of spending across categories.
- **Monthly Trend Bar Chart:** Chronological month-over-month spend trajectory and coin generation totals.
- **Bidirectional Cross-Filtering:**
  - Clicking any slice in the category chart instantly filters the transactions table.
  - Applying filters on the table (date range, status, amount range) reshapes both analytics charts dynamically via server-side aggregation.

### 3. Coin Rewards System & Atomic Redemptions
- **Coin Earning Engine:** 1 coin per ₹100 spent on `SUCCESS` payments, capped at 50 coins per transaction (refunds and failed transactions earn 0 coins).
- **Persistent Coin Balance:** Always visible in the navigation header and overview metric cards.
- **Catalogue & Redemption Flow:** Curated catalogue of 6 active reward vouchers (Amazon, Swiggy/Zomato, BookMyShow, Uber, Croma, Statement Cashback).
- **Atomic Concurrency Protection:** Uses database row locking (`SELECT ... FOR UPDATE`) to prevent race conditions and double-spending.
- **Optimistic UI with Clean Rollback:** Optimistic deduction with instant rollback and error banners on HTTP `422` (insufficient balance) or `404` (nonexistent reward).
- **Redemption History:** Audit log of all redeemed vouchers with unique generated promo codes.

---

## 🧱 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + React 18 + TypeScript | Custom design tokens, zero-library table, typed API client |
| **Styling** | Vanilla CSS Tokens (`tokens.css`, `globals.css`) | `#0b0d12` dark theme, JetBrains Mono digit alignment, custom scrollbars |
| **Charts** | Recharts | Interactive SVG pie & bar charts with custom tooltips |
| **Icons** | Lucide React | Clean, lightweight icon suite |
| **Backend** | Python 3.11 + FastAPI + Uvicorn | Async ASGI server, Pydantic v2 validation, modular routers |
| **ORM & DB** | PostgreSQL 18 + SQLAlchemy 2.0 | Normalized relational schema, indexes, check constraints |
| **Testing** | Pytest + FastAPI TestClient | 17 automated tests covering transactions, analytics, and rewards |

---

## 📁 Project Structure

```
digital-alpha/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Environment settings & CORS
│   │   │   └── db.py               # Engine, pooling & session factory
│   │   ├── models/
│   │   │   └── models.py           # SQLAlchemy relational models
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic v2 request/response schemas
│   │   ├── routers/
│   │   │   ├── transactions.py     # Paginated & filtered transactions API
│   │   │   ├── analytics.py        # Category & monthly spend analytics
│   │   │   ├── rewards.py          # Wallet, catalogue & atomic redeem API
│   │   │   └── categories.py       # Categories lookup API
│   │   └── main.py                 # FastAPI application entry point
│   ├── requirements.txt
│   ├── schema.sql                  # PostgreSQL 18 DDL schema script
│   ├── seed.py                     # Data ingestion & normalization pipeline
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # App layout & font configurations
│   │   └── page.tsx                # Main dashboard page
│   ├── components/
│   │   ├── ui/                     # Button, Card, Badge, Input, Select, StatCard
│   │   ├── table/                  # TransactionsTable & FilterBar (hand-crafted)
│   │   ├── analytics/              # SpendByCategoryChart & MonthlyTrendChart
│   │   ├── rewards/                # RewardsCatalogue, ConfirmModal & SuccessModal
│   │   └── modals/                 # TransactionDetailModal
│   ├── lib/
│   │   └── api.ts                  # Typed API fetch client
│   ├── styles/
│   │   ├── tokens.css              # Design token definitions
│   │   └── globals.css             # Base reset & utility styles
│   ├── types/
│   │   └── index.ts                # TypeScript domain models
│   ├── package.json
│   └── tsconfig.json
├── tests/
│   ├── conftest.py                 # In-memory test DB & client fixtures
│   ├── test_transactions.py        # Pagination, filter & search tests
│   ├── test_analytics.py           # Spend breakdown & trend tests
│   └── test_rewards.py             # Atomic redemption & 422 error tests
├── docs/
│   ├── ASSUMPTIONS.md              # Product & business assumptions
│   ├── DECISIONS.md                # Architectural & technical decisions
│   └── AI-USAGE.md                 # AI usage & transparency report
├── docker-compose.yml              # Multi-container orchestration
├── transactions.json               # 10,000 raw transactions dataset
└── README.md
```

---

## 🚀 Quick Start (Under 5 Minutes)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **PostgreSQL 18** (or uses SQLite local fallback automatically)

---

### Step 1: Backend Setup & Seed Database

```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Run the one-command database seed (cleans, deduplicates & ingests 10k transactions)
python backend/seed.py transactions.json

# 3. Start the FastAPI backend server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API runs at **http://localhost:8000** (OpenAPI documentation at **http://localhost:8000/docs**).

---

### Step 2: Frontend Setup

```bash
# In a new terminal:
cd frontend

# 1. Install frontend dependencies
npm install

# 2. Start Next.js development server
npm run dev
```
Open **http://localhost:3000** in your browser.

---

### Running with Docker Compose (Postgres 18 + Backend + Frontend)

```bash
docker-compose up --build
```

---

### Running Automated Test Suite

```bash
python -m pytest -v
```
Runs 17 comprehensive backend tests across transactions, search, sorting, analytics aggregates, and atomic redemption concurrency rules.

---

## 🌐 REST API Reference

| Method | Endpoint | Query / Body | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check & system status |
| `GET` | `/api/transactions` | `page, page_size, category, search, status, payment_method, min_amount, max_amount, start_date, end_date, sort_by, sort_order` | Paginated, filtered & sorted transactions |
| `GET` | `/api/transactions/{id}` | — | Single transaction detail by reference ID |
| `GET` | `/api/categories` | — | List of all active spend categories |
| `GET` | `/api/transactions/analytics/by-category` | `category, search, status, min_amount, max_amount, start_date, end_date` | Category spend aggregation & percentages |
| `GET` | `/api/transactions/analytics/monthly-trend` | `category, search, status, start_date, end_date` | Monthly spend trajectory & coin earnings |
| `GET` | `/api/transactions/analytics/summary` | — | High-level metrics (total spend, success rate, refunds) |
| `GET` | `/api/wallet` | — | Current user coin balance & lifetime statistics |
| `GET` | `/api/rewards` | — | Active reward vouchers catalogue |
| `POST` | `/api/rewards/redeem` | `{ "reward_id": int }` | Atomic coin redemption with balance deduction |
| `GET` | `/api/rewards/history` | — | Previous redemption history & voucher codes |

---

## 🧠 Documentation & Process

- **[ASSUMPTIONS.md](docs/ASSUMPTIONS.md):** Details on single-user wallet scope, coin capping logic (50 max per transaction), refund handling (`is_refund = TRUE`), and data cleansing rules.
- **[DECISIONS.md](docs/DECISIONS.md):** Rationale for normalized PostgreSQL 18 relational schema, server-side pagination over virtualization, zero-library table constraint, and atomic row locking (`FOR UPDATE`).
- **[AI-USAGE.md](docs/AI-USAGE.md):** Transparent report on where AI tools were used and 3 real examples of AI output discarded/refactored (client-side array slicing, race conditions in redemption, and filter clobbering).

---

## 📦 Requirements Checklist

- [x] **Transactions Table (10k rows):** Hand-built table (no component library), sticky header, hover/focus states, loading shimmer, empty/error states, responsive to 360px.
- [x] **Server-Side Operations:** Pagination, combinable multi-filters, debounced search, and multi-column sorting computed in database.
- [x] **Spend Analytics:** Spend by category donut chart + Monthly spend trend bar chart.
- [x] **Bidirectional Cross-Filtering:** Chart slice click filters table; table filters reshape charts.
- [x] **Coin Rewards & Redemption:** Persistent balance, catalogue grid, select → confirm → done flow, atomic deduction with row locks, 422 / 404 status codes, and optimistic rollback.
- [x] **PostgreSQL 18 Relational Schema:** Relational DDL (`schema.sql`) and one-command seed (`backend/seed.py`).
- [x] **17 Passing Tests:** Pytest test suite for transactions, analytics, and rewards.
- [x] **Documentation Deliverables:** `README.md`, `ASSUMPTIONS.md`, `DECISIONS.md`, and `AI-USAGE.md`.
- [x] **Version Control:** Structured across 15 clean, incremental git commits.
#   a l p h a - d i g i t a l - t a s k -  
 
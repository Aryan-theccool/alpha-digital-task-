# Technical Architecture Document — Digital Alpha

## Stack and reasoning
- **Next.js + TypeScript (React)** — required by the brief; App Router gives clean route
  organization for a single dashboard page plus future routes without extra tooling.
- **FastAPI (Python)** — required; async-friendly, automatic OpenAPI docs, and Pydantic gives
  request/response validation for free (matters a lot for the redeem endpoint's error cases).
- **PostgreSQL 18** — required, non-negotiable per the brief. Real relational schema instead
  of dumping JSON in a column, so filtering/sorting/aggregation happens in the DB, not in
  application memory.
- **SQLAlchemy** — explicit models and queries over an ORM abstraction that hides what SQL is
  actually running; matters when the whole point is server-side query performance.
- **Recharts** — declarative, React-native charting; explicitly allowed by the brief.
- **No component library for the table** — required constraint; hand-rolled CSS using the
  design tokens below.

## Folder structure
```
digital-alpha/
├── docker-compose.yml
├── README.md
├── docs/
│   ├── ASSUMPTIONS.md
│   ├── DECISIONS.md
│   └── AI-USAGE.md
├── backend/
│   ├── requirements.txt
│   ├── schema.sql
│   ├── seed.py
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── core/
│       │   └── db.py
│       ├── models/
│       │   └── models.py
│       ├── schemas/
│       │   └── schemas.py
│       └── routers/
│           ├── transactions.py
│           └── rewards.py
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.local.example
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ui/           (Button, Card, Modal)
    │   └── table/         (hand-built Table)
    ├── lib/
    │   └── api.ts
    └── styles/
        ├── tokens.css
        └── globals.css
```

## Database schema (plain English)
- **categories** — lookup table of spend categories (Travel, Food & Dining, etc.), so the
  category filter matches against a fixed set, not free text.
- **transactions** — one row per transaction: who it's with (`merchant`), how much
  (`amount`), when (`occurred_at`), what category, what status, whether it's a refund
  (`is_refund`), and how many coins it earned. Links to `categories` by foreign key.
- **wallet** — a single row holding the coin balance (single-user scope). A database-level
  check constraint (`coin_balance >= 0`) makes an invalid balance structurally impossible.
- **rewards** — the redemption catalogue: title, description, coin cost, active flag.
- **redemptions** — a log of every redemption made, linked to which reward and how many
  coins it cost, so balance history is auditable.

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string, e.g. `postgresql://alpha:alpha@localhost:5432/digital_alpha` |
| `NEXT_PUBLIC_API_URL` | frontend | Base URL the frontend calls for the API — set to the deployed backend URL in production |

## Notes before building
- Server does all filtering/sorting/pagination — the frontend never holds all 10k rows at
  once, only the current page.
- CORS is currently locked to `localhost:3000` in `main.py` — add the deployed frontend
  origin before shipping.
- The seed script is idempotent-ish (`ON CONFLICT DO NOTHING` on transaction IDs) but assumes
  a fresh schema; re-running against an already-seeded DB after a schema change means dropping
  and recreating first.

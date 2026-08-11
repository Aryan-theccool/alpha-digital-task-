# Frontend Specification Document — Digital Alpha

## Design system

### Color palette
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#0b0d12` | Page background |
| `--color-surface` | `#14171f` | Cards, table body |
| `--color-surface-raised` | `#1c202b` | Modals, dropdowns, table header |
| `--color-border` | `#2a2f3d` | Dividers, input borders |
| `--color-text-primary` | `#e8eaf0` | Body text |
| `--color-text-secondary` | `#9aa0b2` | Labels, meta text |
| `--color-accent` | `#6c8cff` | Primary actions, links, active states |
| `--color-accent-hover` | `#8aa4ff` | Hover on accent elements |
| `--color-success` | `#4ade80` | SUCCESS status, positive states |
| `--color-danger` | `#f87171` | FAILED status, errors |
| `--color-warning` | `#fbbf24` | PENDING status |

### Typography
- **Sans (UI/body):** Inter, system-ui fallback
- **Mono (amounts/IDs):** JetBrains Mono — numeric alignment matters in a transaction table
- Scale: `12 / 13 / 14 / 16 / 20 / 28` px (`--text-xs` through `--text-2xl`)
- Body defaults to 14px; table cells use mono for `amount` and `id` columns specifically for
  digit alignment, sans for everything else.

### Spacing
4px base scale: `4 / 8 / 12 / 16 / 24 / 32 / 48` px (`--space-1` through `--space-7`).
Component internal padding uses `--space-3`/`--space-4`; section gaps use `--space-5`/`--space-6`.

### Component styles
- **Button:** `--radius-sm` corners, `--space-2` `--space-4` padding. Primary = accent
  background, white text. Secondary = transparent, border in `--color-border`, text primary.
  Hover darkens/lightens by one step; disabled = 40% opacity, no hover.
- **Input:** surface-raised background, 1px `--color-border`, `--radius-sm`. Focus = 2px
  accent outline, no border color change (keeps layout stable).
- **Card:** surface background, `--radius-md`, `--shadow-md`, `--space-4` padding.
- **Modal:** surface-raised, `--radius-lg`, centered, `--shadow-md`, dimmed backdrop
  (`rgba(0,0,0,0.6)`). Hand-built: focus trap on open, `Escape` closes, focus returns to the
  trigger element on close.
- **Table** (hand-built, no library): sticky header at `--color-surface-raised`, row hover =
  `--color-surface-raised`, focus-visible row outline in accent, loading = skeleton rows not a
  spinner overlay, empty = centered message + icon, error = inline message + retry button.
  Status column uses colored dot + text (success/danger/warning tokens) rather than colored
  row backgrounds, so it reads at a glance without overwhelming the row.

### Layout rules
- Max content width 1280px, centered, `--space-6` side padding, down to `--space-4` at
  mobile widths.
- Dashboard order top→bottom: coin balance → charts (side by side ≥768px, stacked below) →
  filter bar → transactions table.
- Table must hold together down to 360px width: on narrow screens, lower-priority columns
  (payment method) collapse first; merchant + amount + status stay visible.

## API / integration spec

This app has **no required third-party service integrations** in scope — no payment
processor, no SMS/email provider, no external auth. All data (transactions, wallet, rewards)
is served from the app's own Postgres-backed FastAPI. This is deliberate: the brief describes
a self-contained slice of a bigger product, and adding real integrations (e.g. Stripe for
"real" payments) would be out of scope and unverifiable in a 24-hour window.

If this were extended toward production, the two integration points that would matter:
| Service | Purpose | Notes |
|---|---|---|
| Payment processor (e.g. Razorpay/Stripe) | Actually process the credit-card bill payment | Not built — payments are simulated by inserting a `SUCCESS` transaction row |
| Email/push provider | Redemption confirmations, payment receipts | Not built — out of scope |

Internal API surface (self-hosted, documented in `4-TECHNICAL-ARCHITECTURE.md`):
- `GET /api/transactions` — paginated, filtered, sorted transaction list
- `GET /api/transactions/analytics/by-category` — category totals
- `GET /api/transactions/analytics/monthly-trend` — monthly totals
- `GET /api/wallet` — coin balance
- `GET /api/rewards` — active rewards catalogue
- `POST /api/rewards/redeem` — redeem a reward, body `{ reward_id }`

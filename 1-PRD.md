# Product Requirements Document — Digital Alpha

## What it does
A consumer app for paying credit-card bills, earning reward coins on successful payments, and
reviewing personal spending. Three pillars: transactions dashboard, spend analytics, and a
coin-based rewards/redemption system.

## Who it's for
Individual credit-card holders who want a single place to see their transaction history,
understand where their money goes by category and over time, and get tangible value (coins →
rewards) back on spend they're already making.

## Problem it solves
Card statements are hard to scan, slow to filter, and give no feedback loop. Users can't
quickly answer "how much did I spend on X this month" or "what do I get for paying on time."
This app turns a large, dense transaction ledger into something explorable, and turns payment
activity into a small ongoing reward.

## Core features

| Feature | Priority |
|---|---|
| Transactions table (10k rows, filter/search/sort, row detail) | Must-have |
| Spend by category chart | Must-have |
| Coin balance (earn on successful payments) | Must-have |
| Redeem coins against a rewards catalogue | Must-have |
| Monthly spend trend chart | Should-have |
| Chart → table filtering (click a slice, table filters) | Should-have |
| Server-side pagination/filter/sort | Should-have |
| Optimistic redeem with rollback on failure | Should-have |
| Two-way cross-filtering (table ↔ charts) | Nice-to-have |
| Accessibility polish, tests, walkthrough video | Nice-to-have |

## User flow
1. User lands on the dashboard, sees coin balance and spend charts up top.
2. Scrolls/scans the transaction table below — searches a merchant, filters by category and
   date range, sorts by amount.
3. Clicks a row → detail drawer/modal with full transaction info.
4. Clicks a chart segment → table filters down to that category.
5. Opens the rewards panel, sees balance and catalogue, picks a reward, confirms, balance
   updates immediately.

## MVP
Everything in the "Must-have" row above, on a real Postgres-backed API, deployed (or recorded
as a demo). Everything else is explicitly scoped as a stretch, in priority order.

## Success measures (for this exercise)
- Table stays responsive (smooth scroll/filter/sort) against the full 10k-row dataset.
- Redeem flow never leaves the balance in an inconsistent state, including on failure.
- A reviewer can run the seed command and have a working app in under five minutes.

## Explicitly not in v1
- Authentication / multi-user accounts (single implicit wallet — see ASSUMPTIONS.md)
- Actually charging a card or moving real money — this is a UI/data exercise, payments are
  simulated
- Real third-party reward fulfillment integrations
- Notifications, budgeting goals, or export features

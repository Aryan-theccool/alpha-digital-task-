-- Digital Alpha Technologies - PostgreSQL 18 Relational Schema
-- Normalized relational schema for transactions, wallet, rewards, and analytics.

-- 1. Drop existing tables if recreating
DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS wallet CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. Categories lookup table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Transactions ledger table
CREATE TABLE transactions (
    id VARCHAR(64) PRIMARY KEY,
    merchant VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
    is_refund BOOLEAN NOT NULL DEFAULT FALSE,
    coins_earned INT NOT NULL DEFAULT 0,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance server-side filtering, sorting, and analytics
CREATE INDEX idx_transactions_merchant ON transactions (merchant);
CREATE INDEX idx_transactions_category_id ON transactions (category_id);
CREATE INDEX idx_transactions_status ON transactions (status);
CREATE INDEX idx_transactions_occurred_at ON transactions (occurred_at DESC);
CREATE INDEX idx_transactions_amount ON transactions (amount);
CREATE INDEX idx_transactions_filter_composite ON transactions (status, occurred_at DESC);

-- 4. Single-user wallet table with balance check constraint
CREATE TABLE wallet (
    id SERIAL PRIMARY KEY,
    coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    total_coins_earned INT NOT NULL DEFAULT 0 CHECK (total_coins_earned >= 0),
    total_coins_redeemed INT NOT NULL DEFAULT 0 CHECK (total_coins_redeemed >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Rewards catalogue table
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Voucher',
    coin_cost INT NOT NULL CHECK (coin_cost > 0),
    voucher_value_inr NUMERIC(10, 2) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'gift',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Redemptions audit log
CREATE TABLE redemptions (
    id SERIAL PRIMARY KEY,
    reward_id INT NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    coins_spent INT NOT NULL CHECK (coins_spent > 0),
    voucher_code VARCHAR(64) NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_redeemed_at ON redemptions (redeemed_at DESC);

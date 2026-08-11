"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, 
  Coins, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Gift, 
  Layers, 
  Search,
  RefreshCw,
  ExternalLink,
  Shield,
  HelpCircle,
  Database,
  Download,
  Sparkles,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { 
  Transaction, 
  PaginationMeta, 
  TransactionFilterParams, 
  CategorySpendItem, 
  MonthlyTrendItem, 
  Wallet, 
  Reward, 
  RedemptionHistoryItem,
  AnalyticsSummary 
} from "../types";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { SpendByCategoryChart } from "../components/analytics/SpendByCategoryChart";
import { MonthlyTrendChart } from "../components/analytics/MonthlyTrendChart";
import { FilterBar } from "../components/table/FilterBar";
import { TransactionsTable } from "../components/table/TransactionsTable";
import { TransactionDetailModal } from "../components/modals/TransactionDetailModal";
import { RewardsCatalogue } from "../components/rewards/RewardsCatalogue";
import { Interactive3DCard } from "../components/ui/Interactive3DCard";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { Logo } from "../components/ui/Logo";

export default function DashboardPage() {
  // Navigation & View state
  const [activeView, setActiveView] = useState<"dashboard" | "rewards">("dashboard");

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Active Filters State
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    page_size: 25,
    category: "all",
    search: "",
    status: "all",
    payment_method: "all",
    min_amount: "",
    max_amount: "",
    start_date: "",
    end_date: "",
    sort_by: "occurred_at",
    sort_order: "desc",
  });

  // Analytics State
  const [categorySpend, setCategorySpend] = useState<CategorySpendItem[]>([]);
  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Wallet & Rewards State
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistoryItem[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Selected Transaction Modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
      const response = await api.getTransactions(filters);
      setTransactions(response.items);
      setMeta(response.meta);
      if (response.categories && response.categories.length > 0) {
        setCategories(response.categories);
      }
    } catch (err: any) {
      setTransactionsError(err instanceof ApiError ? err.message : "Failed to load transactions.");
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [filters]);

  // Fetch Analytics (Bidirectional Cross-Filtering)
  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const [categoryRes, trendRes, summaryRes] = await Promise.all([
        api.getSpendByCategory({
          category: filters.category,
          search: filters.search,
          status: filters.status,
          min_amount: filters.min_amount,
          max_amount: filters.max_amount,
          start_date: filters.start_date,
          end_date: filters.end_date,
        }),
        api.getMonthlyTrend({
          category: filters.category,
          search: filters.search,
          status: filters.status,
          start_date: filters.start_date,
          end_date: filters.end_date,
        }),
        api.getAnalyticsSummary(),
      ]);

      setCategorySpend(categoryRes.data);
      setTotalSpend(categoryRes.total_spend);
      setMonthlyTrend(trendRes.data);
      setSummary(summaryRes);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [
    filters.category,
    filters.search,
    filters.status,
    filters.min_amount,
    filters.max_amount,
    filters.start_date,
    filters.end_date,
  ]);

  // Fetch Wallet & Rewards
  const fetchWalletAndRewards = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      const [walletData, rewardsData, historyData] = await Promise.all([
        api.getWallet(),
        api.getRewards(),
        api.getRedemptionHistory(),
      ]);
      setWallet(walletData);
      setRewards(rewardsData);
      setRedemptionHistory(historyData);
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchWalletAndRewards();
  }, [fetchWalletAndRewards]);

  // Fetch data when filters change
  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();
  }, [fetchTransactions, fetchAnalytics]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 25,
      category: "all",
      search: "",
      status: "all",
      payment_method: "all",
      min_amount: "",
      max_amount: "",
      start_date: "",
      end_date: "",
      sort_by: "occurred_at",
      sort_order: "desc",
    });
  };

  const handleSelectCategorySlice = (category: string) => {
    handleFilterChange({ category, page: 1 });
  };

  const handleRowClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setIsDetailModalOpen(true);
  };

  // CSV Export Handler with robust fallback and toast notification
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const exportUrl = api.getExportCsvUrl(filters);
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error("Export failed");
      
      const csvText = await res.text();
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `digital-alpha-ledger-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);

      setExportToast("Ledger CSV downloaded successfully!");
      setTimeout(() => setExportToast(null), 3500);
    } catch (err) {
      console.error("Export error:", err);
      // Fallback: direct window download
      window.open(api.getExportCsvUrl(filters), "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Ambient Aurora Canvas */}
      <AmbientBackground />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(11, 13, 18, 0.82)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          className="app-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "var(--space-3)",
            paddingBottom: "var(--space-3)",
          }}
        >
          {/* Logo & Title */}
          <Logo size={36} showText={true} />

          {/* Navigation Links & Persistent Coin Balance */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {/* View Switcher */}
            <div
              style={{
                display: "flex",
                backgroundColor: "var(--color-surface)",
                padding: "3px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <button
                onClick={() => setActiveView("dashboard")}
                style={{
                  padding: "5px 14px",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: activeView === "dashboard" ? "var(--color-surface-raised)" : "transparent",
                  color: activeView === "dashboard" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView("rewards")}
                style={{
                  padding: "5px 14px",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: activeView === "rewards" ? "var(--color-surface-raised)" : "transparent",
                  color: activeView === "rewards" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  transition: "all var(--transition-fast)",
                }}
              >
                Rewards Catalogue
              </button>
            </div>

            {/* Coin Balance Pill */}
            <button
              onClick={() => setActiveView("rewards")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "6px 14px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.08) 100%)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "var(--radius-full)",
                color: "var(--color-gold)",
                cursor: "pointer",
                boxShadow: "0 0 14px rgba(245, 158, 11, 0.2)",
                transition: "all var(--transition-fast)",
              }}
            >
              <Coins size={15} />
              <span className="font-mono" style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>
                {wallet ? <AnimatedCounter value={wallet.coin_balance} /> : "..."}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.85 }}>Coins</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-6)", position: "relative", zIndex: 1 }}>
        {/* Luxury Hero Banner with 3D Card + Live Ticker */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-5)",
            alignItems: "center",
            padding: "var(--space-5)",
            backgroundColor: "rgba(20, 23, 31, 0.65)",
            backdropFilter: "blur(10px)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Left: Overview Copy & Quick Redeem CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content", padding: "3px 10px", borderRadius: "var(--radius-full)", backgroundColor: "rgba(108,140,255,0.12)", border: "1px solid rgba(108,140,255,0.25)", color: "var(--color-accent)", fontSize: "11px", fontWeight: 600 }}>
              <Zap size={13} />
              <span>EARN 1 COIN PER ₹100 SPENT</span>
            </div>

            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              Spend smarter. Track 10k transactions & earn instant coin rewards.
            </h2>

            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Your Titanium card ledger is connected with real-time PostgreSQL server-side queries. Filter 10,000 ledger records with sub-10ms response times.
            </p>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <Button
                variant="gold"
                size="md"
                leftIcon={<Gift size={16} />}
                onClick={() => setActiveView("rewards")}
              >
                Redeem Rewards Catalogue
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Download size={14} />}
                onClick={handleExportCSV}
              >
                Export CSV Ledger
              </Button>
            </div>
          </div>

          {/* Right: Interactive 3D Holographic Card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Interactive3DCard
              coinBalance={wallet ? wallet.coin_balance : 256415}
              cardNumber="•••• •••• •••• 8829"
              cardHolder="ALPHA MEMBER"
            />
          </div>
        </section>

        {/* Metric Overview Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {/* Coin Balance */}
          <StatCard
            title="Reward Coins Balance"
            value={wallet ? `${wallet.coin_balance.toLocaleString()} 🪙` : "..."}
            subtitle={wallet ? `${wallet.total_coins_redeemed.toLocaleString()} redeemed lifetime` : ""}
            icon={<Coins size={18} />}
            variant="gold"
          />

          {/* Total Spend */}
          <StatCard
            title="Total Spend Volume"
            value={summary ? `₹${Math.round(summary.total_spend_inr).toLocaleString("en-IN")}` : "..."}
            subtitle={summary ? `${summary.successful_transactions.toLocaleString()} successful payments` : ""}
            icon={<CreditCard size={18} />}
            variant="accent"
          />

          {/* Total Transactions */}
          <StatCard
            title="Total Transactions"
            value={summary ? summary.total_transactions.toLocaleString() : "..."}
            subtitle={summary ? `Avg Ticket: ₹${Math.round(summary.average_ticket_inr).toLocaleString()}` : ""}
            icon={<Layers size={18} />}
          />

          {/* Success Rate */}
          <StatCard
            title="Payment Success Rate"
            value={summary ? `${summary.success_rate_percentage}%` : "..."}
            subtitle={summary ? `${summary.total_refunds_count} refunds logged` : ""}
            icon={<CheckCircle2 size={18} />}
            variant="success"
          />
        </section>

        {activeView === "dashboard" ? (
          <>
            {/* Spend Analytics Charts Section (Side by Side ≥768px) */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {/* Category Breakdown Chart */}
              <SpendByCategoryChart
                data={categorySpend}
                totalSpend={totalSpend}
                selectedCategory={filters.category}
                onSelectCategory={handleSelectCategorySlice}
                isLoading={isLoadingAnalytics}
              />

              {/* Monthly Spend Trend Chart */}
              <MonthlyTrendChart
                data={monthlyTrend}
                isLoading={isLoadingAnalytics}
              />
            </section>

            {/* Filter Bar with Date Presets & Search */}
            <section>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                onExportCSV={handleExportCSV}
                categories={categories}
                isLoading={isLoadingTransactions}
              />
            </section>

            {/* Hand-Crafted Transactions Table */}
            <section>
              <TransactionsTable
                transactions={transactions}
                meta={meta}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSelectTransaction={handleRowClick}
                isLoading={isLoadingTransactions}
                error={transactionsError}
                onRetry={fetchTransactions}
              />
            </section>
          </>
        ) : (
          /* Rewards Catalogue & History View */
          <section className="animate-fade-in">
            <RewardsCatalogue
              rewards={rewards}
              wallet={wallet}
              onWalletUpdate={setWallet}
              redemptionHistory={redemptionHistory}
              onHistoryUpdate={setRedemptionHistory}
            />
          </section>
        )}
      </main>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Export Success Toast */}
      {exportToast && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            backgroundColor: "var(--color-surface-raised)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            boxShadow: "var(--shadow-lg)",
            color: "var(--color-text-primary)",
            fontSize: "var(--text-sm)",
          }}
        >
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          marginTop: "var(--space-8)",
          padding: "var(--space-5) 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="app-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              Digital Alpha Technologies
            </span>
            <span>• Full Stack Engineer Take-Home Assignment</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Database size={13} color="var(--color-accent)" />
              <span>PostgreSQL 18 Relational Ledger</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={13} color="var(--color-success)" />
              <span>ACID Atomic Redemptions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

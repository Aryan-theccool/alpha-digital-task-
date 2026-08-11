import React from "react";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  AlertCircle,
  Inbox,
  CreditCard
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Transaction, PaginationMeta, TransactionFilterParams } from "../../types";

export interface TransactionsTableProps {
  transactions: Transaction[];
  meta: PaginationMeta | null;
  filters: TransactionFilterParams;
  onFilterChange: (newFilters: Partial<TransactionFilterParams>) => void;
  onSelectTransaction: (txn: Transaction) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  meta,
  filters,
  onFilterChange,
  onSelectTransaction,
  isLoading,
  error,
  onRetry,
}) => {
  const currentSortBy = filters.sort_by || "occurred_at";
  const currentSortOrder = filters.sort_order || "desc";

  const handleSort = (column: string) => {
    if (currentSortBy === column) {
      // Toggle direction
      onFilterChange({
        sort_order: currentSortOrder === "asc" ? "desc" : "asc",
        page: 1,
      });
    } else {
      // New column, default to desc
      onFilterChange({
        sort_by: column,
        sort_order: "desc",
        page: 1,
      });
    }
  };

  const renderSortIcon = (column: string) => {
    if (currentSortBy !== column) {
      return <ArrowUpDown size={13} style={{ color: "var(--color-text-muted)", opacity: 0.6 }} />;
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp size={13} style={{ color: "var(--color-accent)" }} />
    ) : (
      <ArrowDown size={13} style={{ color: "var(--color-accent)" }} />
    );
  };

  const formatAmount = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      {/* Table Scroll Container */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          maxHeight: "680px",
          position: "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "var(--text-sm)",
          }}
        >
          {/* Sticky Header */}
          <thead>
            <tr
              style={{
                backgroundColor: "var(--color-surface-raised)",
                borderBottom: "1px solid var(--color-border)",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              {/* Merchant / Description */}
              <th
                onClick={() => handleSort("merchant")}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Merchant</span>
                  {renderSortIcon("merchant")}
                </div>
              </th>

              {/* Category */}
              <th
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                Category
              </th>

              {/* Date & Time */}
              <th
                onClick={() => handleSort("occurred_at")}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Date</span>
                  {renderSortIcon("occurred_at")}
                </div>
              </th>

              {/* Payment Mode (Hidden on small mobile) */}
              <th
                className="hide-on-mobile"
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                Mode
              </th>

              {/* Status */}
              <th
                onClick={() => handleSort("status")}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </th>

              {/* Amount */}
              <th
                onClick={() => handleSort("amount")}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  textAlign: "right",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                  <span>Amount</span>
                  {renderSortIcon("amount")}
                </div>
              </th>

              {/* Coins Earned */}
              <th
                className="hide-on-mobile"
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                Coins
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {isLoading ? (
              // Loading Skeleton Shimmer Rows
              Array.from({ length: filters.page_size || 10 }).map((_, idx) => (
                <tr
                  key={`skeleton-${idx}`}
                  style={{
                    borderBottom: "1px solid var(--color-border-subtle)",
                    height: "52px",
                  }}
                >
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "140px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "80px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "100px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                      }}
                    />
                  </td>
                  <td className="hide-on-mobile" style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "70px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "18px",
                        width: "75px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-full)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "90px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                        marginLeft: "auto",
                      }}
                    />
                  </td>
                  <td className="hide-on-mobile" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                    <div
                      className="animate-pulse-subtle"
                      style={{
                        height: "14px",
                        width: "40px",
                        backgroundColor: "var(--color-surface-raised)",
                        borderRadius: "var(--radius-xs)",
                        marginLeft: "auto",
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={7} style={{ padding: "var(--space-8) var(--space-4)", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      color: "var(--color-danger)",
                    }}
                  >
                    <AlertCircle size={36} />
                    <span style={{ fontSize: "var(--text-md)", fontWeight: 500 }}>
                      {error}
                    </span>
                    <Button variant="secondary" size="sm" onClick={onRetry}>
                      Retry Loading
                    </Button>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} style={{ padding: "var(--space-8) var(--space-4)", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Inbox size={40} style={{ color: "var(--color-text-muted)" }} />
                    <div>
                      <h3 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                        No transactions found
                      </h3>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Try clearing or adjusting your search filters to view records.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              transactions.map((txn) => {
                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectTransaction(txn);
                      }
                    }}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                      cursor: "pointer",
                      transition: "background-color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Merchant */}
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {txn.merchant}
                        </span>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {txn.id}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <Badge variant="neutral" size="sm">
                        {txn.category || "Uncategorized"}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td
                      className="font-mono"
                      style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "var(--color-text-primary)" }}>
                          {formatDate(txn.occurred_at)}
                        </span>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                          {formatTime(txn.occurred_at)}
                        </span>
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td
                      className="hide-on-mobile"
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        color: "var(--color-text-secondary)",
                        fontSize: "var(--text-xs)",
                      }}
                    >
                      {txn.payment_method}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <Badge
                        status={txn.status}
                        isRefund={txn.is_refund}
                        size="sm"
                      />
                    </td>

                    {/* Amount */}
                    <td
                      className="font-mono"
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: "var(--text-sm)",
                        color: txn.is_refund
                          ? "#c084fc"
                          : txn.status === "SUCCESS"
                          ? "var(--color-text-primary)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {txn.is_refund ? `+${formatAmount(txn.amount)}` : formatAmount(txn.amount)}
                    </td>

                    {/* Coins */}
                    <td
                      className="font-mono hide-on-mobile"
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        textAlign: "right",
                        fontSize: "var(--text-xs)",
                        color: txn.coins_earned > 0 ? "var(--color-gold)" : "var(--color-text-muted)",
                        fontWeight: txn.coins_earned > 0 ? 600 : 400,
                      }}
                    >
                      {txn.coins_earned > 0 ? `+${txn.coins_earned}` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Bar */}
      {meta && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-surface-raised)",
            borderTop: "1px solid var(--color-border)",
            gap: "var(--space-3)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          {/* Total Counter & Page Size Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div>
              Showing{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {meta.total === 0 ? 0 : (meta.page - 1) * meta.page_size + 1}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {Math.min(meta.page * meta.page_size, meta.total)}
              </strong>{" "}
              of <strong style={{ color: "var(--color-text-primary)" }}>{meta.total.toLocaleString()}</strong> results
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Rows:</span>
              <select
                value={meta.page_size}
                onChange={(e) => onFilterChange({ page_size: Number(e.target.value), page: 1 })}
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 6px",
                  fontSize: "var(--text-xs)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ marginRight: "var(--space-2)" }}>
              Page <strong style={{ color: "var(--color-text-primary)" }}>{meta.page}</strong> of{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>{meta.total_pages}</strong>
            </span>

            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => onFilterChange({ page: 1 })}
              aria-label="First page"
            >
              <ChevronsLeft size={14} />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.has_prev || isLoading}
              onClick={() => onFilterChange({ page: meta.page - 1 })}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </Button>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.has_next || isLoading}
              onClick={() => onFilterChange({ page: meta.page + 1 })}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.total_pages || isLoading}
              onClick={() => onFilterChange({ page: meta.total_pages })}
              aria-label="Last page"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive column collapsing */}
      <style jsx>{`
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

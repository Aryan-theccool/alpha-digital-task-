import React, { useState, useEffect, useRef } from "react";
import { Search, X, Filter, RotateCcw, Calendar, DollarSign, Download, Sparkles } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { TransactionFilterParams } from "../../types";

export interface FilterBarProps {
  filters: TransactionFilterParams;
  onFilterChange: (newFilters: Partial<TransactionFilterParams>) => void;
  onReset: () => void;
  onExportCSV?: () => void;
  categories: string[];
  isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExportCSV,
  categories,
  isLoading,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  // Sync external search changes
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Keyboard shortcut: Press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "SUCCESS", label: "SUCCESS" },
    { value: "FAILED", label: "FAILED" },
    { value: "PENDING", label: "PENDING" },
  ];

  const paymentMethodOptions = [
    { value: "all", label: "All Modes" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "UPI", label: "UPI" },
    { value: "Netbanking", label: "Netbanking" },
  ];

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
    (filters.category && filters.category !== "all") ||
    (filters.status && filters.status !== "all") ||
    (filters.payment_method && filters.payment_method !== "all") ||
    (filters.min_amount !== undefined && filters.min_amount !== "") ||
    (filters.max_amount !== undefined && filters.max_amount !== "") ||
    filters.start_date ||
    filters.end_date
  );

  const applyDatePreset = (preset: "7d" | "30d" | "90d" | "this_month" | "all") => {
    if (preset === "all") {
      onFilterChange({ start_date: "", end_date: "", page: 1 });
      return;
    }

    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    let start = new Date();

    if (preset === "7d") {
      start.setDate(now.getDate() - 7);
    } else if (preset === "30d") {
      start.setDate(now.getDate() - 30);
    } else if (preset === "90d") {
      start.setDate(now.getDate() - 90);
    } else if (preset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startStr = start.toISOString().split("T")[0];
    onFilterChange({ start_date: startStr, end_date: endStr, page: 1 });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        backgroundColor: "var(--color-surface)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Primary Bar: Search, Category, Status, Filters Toggle, CSV Export, Reset */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-3)",
          alignItems: "flex-end",
        }}
      >
        {/* Merchant Search with shortcut indicator */}
        <div style={{ gridColumn: "span 2", minWidth: "220px", position: "relative" }}>
          <Input
            ref={searchInputRef}
            placeholder="Search merchant name... (press '/' to focus)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search size={15} />}
            rightIcon={
              searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  style={{ color: "var(--color-text-muted)", display: "flex" }}
                >
                  <X size={14} />
                </button>
              ) : (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                    pointerEvents: "none",
                  }}
                >
                  /
                </span>
              )
            }
          />
        </div>

        {/* Category Filter */}
        <Select
          options={categoryOptions}
          value={filters.category || "all"}
          onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
        />

        {/* Status Filter */}
        <Select
          options={statusOptions}
          value={filters.status || "all"}
          onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
        />

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button
            type="button"
            variant={isAdvancedOpen ? "primary" : "secondary"}
            size="md"
            leftIcon={<Filter size={14} />}
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            style={{ flex: 1 }}
          >
            Filters
          </Button>

          {onExportCSV && (
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<Download size={13} />}
              onClick={onExportCSV}
              title="Export filtered records to CSV"
            >
              Export
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              leftIcon={<RotateCcw size={13} />}
              onClick={onReset}
              title="Reset all filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Quick Presets */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
          Quick Ranges:
        </span>
        <button
          onClick={() => applyDatePreset("all")}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            borderRadius: "var(--radius-full)",
            backgroundColor: !filters.start_date ? "var(--color-surface-hover)" : "var(--color-surface-raised)",
            color: !filters.start_date ? "var(--color-accent)" : "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
          }}
        >
          All Time
        </button>
        <button
          onClick={() => applyDatePreset("this_month")}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface-raised)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
          }}
        >
          This Month
        </button>
        <button
          onClick={() => applyDatePreset("30d")}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface-raised)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
          }}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => applyDatePreset("90d")}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface-raised)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
          }}
        >
          Last 90 Days
        </button>
      </div>

      {/* Advanced Filter Drawer (Amount Range & Date Range) */}
      {isAdvancedOpen && (
        <div
          className="animate-fade-in"
          style={{
            paddingTop: "var(--space-3)",
            marginTop: "var(--space-1)",
            borderTop: "1px solid var(--color-border)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {/* Payment Method */}
          <Select
            label="Payment Mode"
            options={paymentMethodOptions}
            value={filters.payment_method || "all"}
            onChange={(e) => onFilterChange({ payment_method: e.target.value, page: 1 })}
          />

          {/* Min Amount */}
          <Input
            label="Min Amount (₹)"
            type="number"
            placeholder="0"
            value={filters.min_amount || ""}
            onChange={(e) => onFilterChange({ min_amount: e.target.value, page: 1 })}
            leftIcon={<DollarSign size={13} />}
          />

          {/* Max Amount */}
          <Input
            label="Max Amount (₹)"
            type="number"
            placeholder="50000"
            value={filters.max_amount || ""}
            onChange={(e) => onFilterChange({ max_amount: e.target.value, page: 1 })}
            leftIcon={<DollarSign size={13} />}
          />

          {/* Start Date */}
          <Input
            label="From Date"
            type="date"
            value={filters.start_date || ""}
            onChange={(e) => onFilterChange({ start_date: e.target.value, page: 1 })}
            leftIcon={<Calendar size={13} />}
          />

          {/* End Date */}
          <Input
            label="To Date"
            type="date"
            value={filters.end_date || ""}
            onChange={(e) => onFilterChange({ end_date: e.target.value, page: 1 })}
            leftIcon={<Calendar size={13} />}
          />
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            alignItems: "center",
            paddingTop: "var(--space-1)",
          }}
        >
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Active filters:
          </span>

          {filters.category && filters.category !== "all" && (
            <FilterChip
              label={`Category: ${filters.category}`}
              onRemove={() => onFilterChange({ category: "all", page: 1 })}
            />
          )}

          {filters.status && filters.status !== "all" && (
            <FilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => onFilterChange({ status: "all", page: 1 })}
            />
          )}

          {filters.payment_method && filters.payment_method !== "all" && (
            <FilterChip
              label={`Mode: ${filters.payment_method}`}
              onRemove={() => onFilterChange({ payment_method: "all", page: 1 })}
            />
          )}

          {filters.search && (
            <FilterChip
              label={`Search: "${filters.search}"`}
              onRemove={() => {
                setSearchInput("");
                onFilterChange({ search: "", page: 1 });
              }}
            />
          )}

          {(filters.min_amount || filters.max_amount) && (
            <FilterChip
              label={`Amount: ₹${filters.min_amount || "0"} - ₹${filters.max_amount || "∞"}`}
              onRemove={() => onFilterChange({ min_amount: "", max_amount: "", page: 1 })}
            />
          )}

          {(filters.start_date || filters.end_date) && (
            <FilterChip
              label={`Date: ${filters.start_date || "Start"} to ${filters.end_date || "End"}`}
              onRemove={() => onFilterChange({ start_date: "", end_date: "", page: 1 })}
            />
          )}
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      fontSize: "var(--text-xs)",
      borderRadius: "var(--radius-full)",
      backgroundColor: "var(--color-surface-raised)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border)",
    }}
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={onRemove}
      style={{
        display: "flex",
        alignItems: "center",
        color: "var(--color-text-muted)",
        cursor: "pointer",
      }}
    >
      <X size={12} />
    </button>
  </span>
);

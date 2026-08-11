import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "../ui/Card";
import { CategorySpendItem } from "../../types";
import { PieChart as PieChartIcon } from "lucide-react";

export interface SpendByCategoryChartProps {
  data: CategorySpendItem[];
  totalSpend: number;
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
}

const CATEGORY_COLORS = [
  "#6c8cff", // Accent Blue
  "#4ade80", // Emerald Green
  "#f59e0b", // Amber
  "#c084fc", // Purple
  "#38bdf8", // Sky Blue
  "#f472b6", // Pink
  "#fb923c", // Orange
  "#2dd4bf", // Teal
  "#a78bfa", // Violet
  "#94a3b8", // Slate
  "#e879f9", // Fuchsia
];

export const SpendByCategoryChart: React.FC<SpendByCategoryChartProps> = ({
  data,
  totalSpend,
  selectedCategory,
  onSelectCategory,
  isLoading,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: CategorySpendItem = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-2) var(--space-3)",
            boxShadow: "var(--shadow-md)",
            fontSize: "var(--text-xs)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
            {item.category}
          </div>
          <div style={{ color: "var(--color-accent)", marginTop: "2px", fontWeight: 600 }}>
            {formatCurrency(item.total_amount)} ({item.percentage}%)
          </div>
          <div style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
            {item.transaction_count.toLocaleString()} transactions
          </div>
          <div style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Click slice to filter table
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <PieChartIcon size={16} color="var(--color-accent)" />
          <h3
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Spend by Category
          </h3>
        </div>
        {selectedCategory && selectedCategory !== "all" && (
          <button
            onClick={() => onSelectCategory("all")}
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-accent)",
              cursor: "pointer",
            }}
          >
            Clear slice filter
          </button>
        )}
      </div>

      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-3)",
        }}
      >
        Interactive distribution. Click any category slice to filter ledger records.
      </p>

      {/* Chart Canvas */}
      <div style={{ width: "100%", height: "260px", position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="animate-pulse-subtle"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                backgroundColor: "var(--color-surface-raised)",
              }}
            />
          </div>
        ) : data.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No spend data for selected filter
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="total_amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                onClick={(entry) => onSelectCategory(entry.category)}
                cursor="pointer"
              >
                {data.map((entry, index) => {
                  const isSelected = selectedCategory === entry.category;
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      stroke={isSelected ? "#ffffff" : "var(--color-surface)"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{
                        filter: isSelected ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))" : "none",
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pills List */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "var(--space-2)",
          maxHeight: "90px",
          overflowY: "auto",
        }}
      >
        {data.map((item, idx) => {
          const isSelected = selectedCategory === item.category;
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <button
              key={item.category}
              onClick={() => onSelectCategory(isSelected ? "all" : item.category)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "2px 8px",
                fontSize: "11px",
                borderRadius: "var(--radius-full)",
                backgroundColor: isSelected ? "var(--color-surface-hover)" : "var(--color-surface-raised)",
                color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                border: isSelected ? `1px solid ${color}` : "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              <span>{item.category}</span>
              <span className="font-mono" style={{ color: "var(--color-text-muted)" }}>
                {item.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

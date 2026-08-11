import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";
import { MonthlyTrendItem } from "../../types";
import { TrendingUp } from "lucide-react";

export interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
  isLoading?: boolean;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  isLoading,
}) => {
  const formatYAxis = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: MonthlyTrendItem = payload[0].payload;
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
            {item.month_label}
          </div>
          <div style={{ color: "var(--color-accent)", marginTop: "3px", fontWeight: 600 }}>
            Spend: ₹{item.total_spend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div style={{ color: "var(--color-gold)", marginTop: "2px" }}>
            Coins: +{item.coins_earned.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
            {item.transaction_count.toLocaleString()} transactions
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
          <TrendingUp size={16} color="var(--color-accent)" />
          <h3
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Monthly Spend Trend
          </h3>
        </div>
      </div>

      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-3)",
        }}
      >
        Chronological credit-card spend trajectory and reward coin generation.
      </p>

      {/* Chart Canvas */}
      <div style={{ width: "100%", height: "260px", position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              paddingBottom: "20px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse-subtle"
                style={{
                  width: "24px",
                  height: `${30 + (i % 5) * 18}%`,
                  backgroundColor: "var(--color-surface-raised)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
            ))}
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
            No trend data available for current filter
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis
                dataKey="month_label"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total_spend"
                fill="var(--color-accent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

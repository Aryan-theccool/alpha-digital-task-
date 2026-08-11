import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "default" | "gold" | "accent" | "success";
  trend?: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  isPositive,
}) => {
  const getGlow = () => {
    switch (variant) {
      case "gold":
        return "1px solid rgba(245, 158, 11, 0.3)";
      case "accent":
        return "1px solid rgba(108, 140, 255, 0.3)";
      case "success":
        return "1px solid rgba(74, 222, 128, 0.3)";
      default:
        return "1px solid var(--color-border)";
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case "gold":
        return "var(--color-gold)";
      case "accent":
        return "var(--color-accent)";
      case "success":
        return "var(--color-success)";
      default:
        return "var(--color-text-primary)";
    }
  };

  return (
    <Card
      style={{
        border: getGlow(),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "105px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-surface-raised)",
              color: getValueColor(),
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ marginTop: "var(--space-2)" }}>
        <div
          className="font-mono"
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: getValueColor(),
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        {(subtitle || trend) && (
          <div
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {trend && (
              <span
                style={{
                  color: isPositive ? "var(--color-success)" : "var(--color-danger)",
                  fontWeight: 600,
                }}
              >
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

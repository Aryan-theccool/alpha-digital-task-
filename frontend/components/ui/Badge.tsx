import React from "react";
import { PaymentStatus } from "../../types";

export interface BadgeProps {
  variant?: "success" | "danger" | "warning" | "refund" | "accent" | "neutral";
  status?: PaymentStatus;
  isRefund?: boolean;
  children?: React.ReactNode;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  status,
  isRefund,
  children,
  size = "md",
}) => {
  // Determine variant from status if provided
  let effectiveVariant = variant || "neutral";
  let label = children;

  if (isRefund) {
    effectiveVariant = "refund";
    label = label || "REFUND";
  } else if (status === "SUCCESS") {
    effectiveVariant = "success";
    label = label || "SUCCESS";
  } else if (status === "FAILED") {
    effectiveVariant = "danger";
    label = label || "FAILED";
  } else if (status === "PENDING") {
    effectiveVariant = "warning";
    label = label || "PENDING";
  }

  const getColors = () => {
    switch (effectiveVariant) {
      case "success":
        return {
          bg: "var(--color-success-bg)",
          text: "var(--color-success)",
          border: "var(--color-success-border)",
          dot: "var(--color-success)",
        };
      case "danger":
        return {
          bg: "var(--color-danger-bg)",
          text: "var(--color-danger)",
          border: "var(--color-danger-border)",
          dot: "var(--color-danger)",
        };
      case "warning":
        return {
          bg: "var(--color-warning-bg)",
          text: "var(--color-warning)",
          border: "var(--color-warning-border)",
          dot: "var(--color-warning)",
        };
      case "refund":
        return {
          bg: "rgba(168, 85, 247, 0.15)",
          text: "#c084fc",
          border: "rgba(168, 85, 247, 0.35)",
          dot: "#c084fc",
        };
      case "accent":
        return {
          bg: "var(--color-accent-subtle)",
          text: "var(--color-accent)",
          border: "rgba(108, 140, 255, 0.3)",
          dot: "var(--color-accent)",
        };
      case "neutral":
      default:
        return {
          bg: "var(--color-surface-raised)",
          text: "var(--color-text-secondary)",
          border: "var(--color-border)",
          dot: "var(--color-text-muted)",
        };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        fontSize: size === "sm" ? "11px" : "var(--text-xs)",
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: "0.03em",
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: colors.dot,
        }}
      />
      {label}
    </span>
  );
};

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "surface" | "raised" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "surface",
  padding = "md",
  style,
  className = "",
  ...props
}) => {
  const getBg = () => {
    switch (variant) {
      case "raised":
        return "var(--color-surface-raised)";
      case "interactive":
        return "var(--color-surface-card)";
      case "surface":
      default:
        return "var(--color-surface)";
    }
  };

  const getPadding = () => {
    switch (padding) {
      case "none":
        return 0;
      case "sm":
        return "var(--space-3)";
      case "lg":
        return "var(--space-6)";
      case "md":
      default:
        return "var(--space-4)";
    }
  };

  return (
    <div
      style={{
        backgroundColor: getBg(),
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        padding: getPadding(),
        transition: "all var(--transition-fast)",
        ...(variant === "interactive"
          ? {
              cursor: "pointer",
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

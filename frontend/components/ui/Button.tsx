import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case "secondary":
          return {
            backgroundColor: "var(--color-surface-raised)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          };
        case "outline":
          return {
            backgroundColor: "transparent",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            border: "1px solid transparent",
          };
        case "danger":
          return {
            backgroundColor: "var(--color-danger)",
            color: "#ffffff",
            border: "1px solid transparent",
          };
        case "gold":
          return {
            backgroundColor: "var(--color-gold)",
            color: "#000000",
            fontWeight: 600,
            boxShadow: "var(--shadow-gold)",
            border: "1px solid transparent",
          };
        case "primary":
        default:
          return {
            backgroundColor: "var(--color-accent)",
            color: "#ffffff",
            fontWeight: 500,
            boxShadow: "var(--shadow-accent)",
            border: "1px solid transparent",
          };
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      switch (size) {
        case "sm":
          return {
            padding: "4px 10px",
            fontSize: "var(--text-xs)",
            borderRadius: "var(--radius-xs)",
            height: "28px",
          };
        case "lg":
          return {
            padding: "10px 20px",
            fontSize: "var(--text-md)",
            borderRadius: "var(--radius-md)",
            height: "44px",
          };
        case "md":
        default:
          return {
            padding: "6px 14px",
            fontSize: "var(--text-sm)",
            borderRadius: "var(--radius-sm)",
            height: "36px",
          };
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          cursor: disabled || isLoading ? "not-allowed" : "pointer",
          opacity: disabled || isLoading ? 0.45 : 1,
          transition: "all var(--transition-fast)",
          userSelect: "none",
          whiteSpace: "nowrap",
          ...getVariantStyles(),
          ...getSizeStyles(),
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span
            style={{
              width: "14px",
              height: "14px",
              border: "2px solid currentColor",
              borderRightColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

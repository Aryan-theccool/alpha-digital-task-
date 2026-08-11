import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, style, disabled, ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: "100%" }}>
        {label && (
          <label
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </label>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            width: "100%",
          }}
        >
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: "var(--space-3)",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            style={{
              width: "100%",
              height: "36px",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-text-primary)",
              border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-sm)",
              paddingLeft: leftIcon ? "34px" : "var(--space-3)",
              paddingRight: rightIcon ? "34px" : "var(--space-3)",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color var(--transition-fast)",
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "text",
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <div
              style={{
                position: "absolute",
                right: "var(--space-3)",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

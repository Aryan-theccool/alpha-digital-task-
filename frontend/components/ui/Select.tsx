import React, { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, style, disabled, value, ...props }, ref) => {
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
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <select
            ref={ref}
            value={value}
            disabled={disabled}
            style={{
              width: "100%",
              height: "36px",
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-text-primary)",
              border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-sm)",
              paddingLeft: "var(--space-3)",
              paddingRight: "30px",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              outline: "none",
              appearance: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              ...style,
            }}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-primary)",
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            style={{
              position: "absolute",
              right: "var(--space-3)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
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

Select.displayName = "Select";

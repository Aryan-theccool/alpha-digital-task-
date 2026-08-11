import React from "react";

export interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 36, showText = true }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", userSelect: "none" }}>
      {/* Precision Geometric SVG Alpha Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 0 10px rgba(108, 140, 255, 0.45))",
          flexShrink: 0,
        }}
      >
        <rect width="48" height="48" rx="12" fill="url(#logo_grad_bg)" />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="11.5"
          stroke="rgba(255, 255, 255, 0.15)"
        />
        {/* Stylized Modern Alpha Geometric Path */}
        <path
          d="M32 16C28.5 16 25 21 21.5 27.5C19 32 16.5 33 14 33C10.5 33 8.5 30.5 8.5 27C8.5 22.5 12 17 18 17C23.5 17 27.5 22.5 30 27.5L34 35"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.5 27.5C24.5 33 28 35 32 35C35 35 37.5 33 37.5 29.5C37.5 25 34 20 28.5 20"
          stroke="url(#logo_grad_accent)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="logo_grad_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e2640" />
            <stop offset="1" stopColor="#0f1322" />
          </linearGradient>
          <linearGradient id="logo_grad_accent" x1="21.5" y1="20" x2="37.5" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6c8cff" />
            <stop offset="1" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              DIGITAL ALPHA
            </span>
            <span
              style={{
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "3px",
                backgroundColor: "rgba(108, 140, 255, 0.15)",
                color: "var(--color-accent)",
                border: "1px solid rgba(108, 140, 255, 0.3)",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              TITANIUM
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", lineHeight: 1.2 }}>
            Financial Ledger & Rewards
          </span>
        </div>
      )}
    </div>
  );
};

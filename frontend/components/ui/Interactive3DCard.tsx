import React, { useRef, useState } from "react";
import { Wifi, Sparkles, Shield, CreditCard as CardIcon } from "lucide-react";
import { Logo } from "./Logo";

export interface Interactive3DCardProps {
  coinBalance?: number;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  coinBalance = 256415,
  cardNumber = "•••• •••• •••• 8829",
  cardHolder = "ALPHA MEMBER",
  expiry = "08/29",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angles (max 18 degrees)
    const rotX = -((y - centerY) / centerY) * 16;
    const rotY = ((x - centerX) / centerX) * 16;

    setRotateX(rotX);
    setRotateY(rotY);

    // Glare coordinates
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    setIsHovered(false);
  };

  return (
    <div
      style={{
        perspective: "1000px",
        width: "100%",
        maxWidth: "380px",
        height: "220px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "var(--radius-lg)",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.03 : 1})`,
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
          background: "linear-gradient(135deg, #181c28 0%, #0d1017 50%, #161c2e 100%)",
          boxShadow: isHovered
            ? "0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(108,140,255,0.25)"
            : "0 10px 25px -5px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "var(--space-4)",
        }}
      >
        {/* Holographic Specular Glare Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${glarePosition.opacity}) 0%, rgba(108,140,255,${glarePosition.opacity * 0.6}) 30%, transparent 70%)`,
            transition: "opacity 0.2s ease",
            mixBlendMode: "overlay",
          }}
        />

        {/* Ambient Gradient Mesh Background Lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(108, 140, 255, 0.18) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
            opacity: 0.9,
          }}
        />

        {/* Top Row: Issuer Logo & Contactless */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2,
            transform: "translateZ(30px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Logo size={28} showText={false} />
            <span
              style={{
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.15em",
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              DIGITAL ALPHA
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wifi size={18} style={{ color: "rgba(255,255,255,0.7)", transform: "rotate(90deg)" }} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--color-gold)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              TITANIUM BLACK
            </span>
          </div>
        </div>

        {/* Middle Row: EMV Metallic Chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
            transform: "translateZ(25px)",
            marginTop: "var(--space-1)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "32px",
              borderRadius: "5px",
              background: "linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa7c11 100%)",
              border: "1px solid rgba(0,0,0,0.3)",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 5px rgba(0,0,0,0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Chip contacts pattern */}
            <div
              style={{
                position: "absolute",
                top: "35%",
                left: 0,
                right: 0,
                height: "1px",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "65%",
                left: 0,
                right: 0,
                height: "1px",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "48%",
                width: "1px",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            <Sparkles size={13} color="var(--color-gold)" />
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--color-gold)", fontWeight: 700 }}>
              {coinBalance.toLocaleString()} COINS
            </span>
          </div>
        </div>

        {/* Card Number */}
        <div
          className="font-mono"
          style={{
            fontSize: "17px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            color: "#ffffff",
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            zIndex: 2,
            transform: "translateZ(30px)",
          }}
        >
          {cardNumber}
        </div>

        {/* Bottom Row: Cardholder & Expiry */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            zIndex: 2,
            transform: "translateZ(20px)",
          }}
        >
          <div>
            <div style={{ fontSize: "9px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Cardholder
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.08em" }}>
              {cardHolder}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Expires
            </div>
            <div className="font-mono" style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>
              {expiry}
            </div>
          </div>

          {/* Dual Mastercard / Interlocking Ring Emblems */}
          <div style={{ display: "flex", position: "relative", width: "36px", height: "24px" }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "rgba(235, 0, 27, 0.85)",
                position: "absolute",
                left: 0,
              }}
            />
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 95, 0, 0.85)",
                position: "absolute",
                right: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

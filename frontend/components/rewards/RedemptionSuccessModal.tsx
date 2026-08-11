import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { RedemptionReceipt } from "../../types";
import { Check, Copy, Sparkles, CheckCircle2, Gift } from "lucide-react";

export interface RedemptionSuccessModalProps {
  receipt: RedemptionReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RedemptionSuccessModal: React.FC<RedemptionSuccessModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(receipt.voucher_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reward Redeemed!"
      description="Your exclusive voucher code is ready to use"
      maxWidth="460px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", textAlign: "center" }}>
        {/* Celebration Badge */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(74, 222, 128, 0.15)",
            color: "var(--color-success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Sparkles size={32} />
        </div>

        <div>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            {receipt.reward_title}
          </h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Worth ₹{receipt.voucher_value_inr.toLocaleString()} • Cost: {receipt.coins_spent.toLocaleString()} Coins
          </p>
        </div>

        {/* Voucher Code Box */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            Voucher Promo Code
          </span>

          <div
            className="font-mono"
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--color-gold)",
              letterSpacing: "0.1em",
              padding: "4px 12px",
              backgroundColor: "var(--color-surface-raised)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              userSelect: "all",
            }}
          >
            {receipt.voucher_code}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            leftIcon={copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
            style={{ marginTop: "var(--space-1)" }}
          >
            {copied ? "Copied to Clipboard!" : "Copy Code"}
          </Button>
        </div>

        <Button variant="primary" onClick={onClose} style={{ width: "100%" }}>
          Done
        </Button>
      </div>
    </Modal>
  );
};

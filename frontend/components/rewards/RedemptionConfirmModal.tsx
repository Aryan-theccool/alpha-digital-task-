import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Reward, Wallet } from "../../types";
import { Coins, AlertTriangle, CheckCircle2, Gift } from "lucide-react";

export interface RedemptionConfirmModalProps {
  reward: Reward | null;
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isRedeeming: boolean;
  error: string | null;
}

export const RedemptionConfirmModal: React.FC<RedemptionConfirmModalProps> = ({
  reward,
  wallet,
  isOpen,
  onClose,
  onConfirm,
  isRedeeming,
  error,
}) => {
  if (!reward || !wallet) return null;

  const hasSufficientCoins = wallet.coin_balance >= reward.coin_cost;
  const balanceAfter = wallet.coin_balance - reward.coin_cost;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Coin Redemption"
      description="Review voucher details and balance deduction"
      maxWidth="460px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Reward Highlight Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            padding: "var(--space-4)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              color: "var(--color-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Gift size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {reward.title}
            </h4>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "2px" }}>
              {reward.description}
            </p>
          </div>
        </div>

        {/* Balance Breakdown Table */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            backgroundColor: "var(--color-surface)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            fontSize: "var(--text-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
            <span>Current Coin Balance</span>
            <span className="font-mono" style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              {wallet.coin_balance.toLocaleString()} coins
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gold)" }}>
            <span>Redemption Cost</span>
            <span className="font-mono" style={{ fontWeight: 700 }}>
              - {reward.coin_cost.toLocaleString()} coins
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "var(--space-2)",
              borderTop: "1px dashed var(--color-border)",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "var(--color-text-primary)" }}>Balance After Redemption</span>
            <span
              className="font-mono"
              style={{
                color: hasSufficientCoins ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {balanceAfter >= 0 ? `${balanceAfter.toLocaleString()} coins` : "Insufficient Coins"}
            </span>
          </div>
        </div>

        {/* Error Warning Banner */}
        {(!hasSufficientCoins || error) && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-2)",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-danger)",
              fontSize: "var(--text-xs)",
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              {error ||
                `You need ${reward.coin_cost - wallet.coin_balance} more coins to redeem this reward.`}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isRedeeming}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="gold"
            onClick={onConfirm}
            disabled={!hasSufficientCoins || isRedeeming}
            isLoading={isRedeeming}
            leftIcon={<CheckCircle2 size={16} />}
            style={{ flex: 2 }}
          >
            {isRedeeming ? "Processing..." : "Confirm & Redeem"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

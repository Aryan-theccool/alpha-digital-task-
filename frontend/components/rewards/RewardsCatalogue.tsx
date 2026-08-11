import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Reward, Wallet, RedemptionReceipt, RedemptionHistoryItem } from "../../types";
import { RedemptionConfirmModal } from "./RedemptionConfirmModal";
import { RedemptionSuccessModal } from "./RedemptionSuccessModal";
import { api, ApiError } from "../../lib/api";
import { fireCoinCelebration } from "../../lib/confetti";
import { 
  Gift, 
  Coins, 
  ShoppingBag, 
  Utensils, 
  Film, 
  Car, 
  Tv, 
  Sparkles,
  History,
  CheckCircle2,
  Clock
} from "lucide-react";

export interface RewardsCatalogueProps {
  rewards: Reward[];
  wallet: Wallet | null;
  onWalletUpdate: (updatedWallet: Wallet) => void;
  redemptionHistory: RedemptionHistoryItem[];
  onHistoryUpdate: (history: RedemptionHistoryItem[]) => void;
}

export const RewardsCatalogue: React.FC<RewardsCatalogueProps> = ({
  rewards,
  wallet,
  onWalletUpdate,
  redemptionHistory,
  onHistoryUpdate,
}) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<RedemptionReceipt | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"catalogue" | "history">("catalogue");

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case "shopping-bag":
        return <ShoppingBag size={20} />;
      case "utensils":
        return <Utensils size={20} />;
      case "film":
        return <Film size={20} />;
      case "car":
        return <Car size={20} />;
      case "tv":
        return <Tv size={20} />;
      case "sparkles":
        return <Sparkles size={20} />;
      default:
        return <Gift size={20} />;
    }
  };

  const handleOpenRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setRedeemError(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !wallet) return;

    setIsRedeeming(true);
    setRedeemError(null);

    // Save previous wallet for optimistic rollback
    const prevWallet = { ...wallet };

    // 1. Optimistic UI update
    onWalletUpdate({
      ...wallet,
      coin_balance: wallet.coin_balance - selectedReward.coin_cost,
      total_coins_redeemed: wallet.total_coins_redeemed + selectedReward.coin_cost,
    });

    try {
      // 2. Call backend API
      const response = await api.redeemReward(selectedReward.id);

      // 3. Confirm with authoritative server balance
      onWalletUpdate({
        ...wallet,
        coin_balance: response.new_coin_balance,
        total_coins_redeemed: wallet.total_coins_redeemed + selectedReward.coin_cost,
      });

      setLastReceipt(response.redemption);
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);

      // Trigger spectacular particle explosion
      fireCoinCelebration();

      // Refresh history
      try {
        const history = await api.getRedemptionHistory();
        onHistoryUpdate(history);
      } catch {}
    } catch (err: any) {
      // 4. Clean Rollback on failure
      onWalletUpdate(prevWallet);

      if (err instanceof ApiError) {
        setRedeemError(err.message);
      } else {
        setRedeemError("Failed to process redemption. Please try again.");
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Rewards & Benefits Catalogue
          </h2>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "2px" }}>
            Earn 1 coin per ₹100 spent on bill payments. Redeem instantly for shopping, dining, and cashback.
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            backgroundColor: "var(--color-surface)",
            padding: "3px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={() => setActiveTab("catalogue")}
            style={{
              padding: "4px 12px",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              borderRadius: "var(--radius-xs)",
              backgroundColor: activeTab === "catalogue" ? "var(--color-surface-raised)" : "transparent",
              color: activeTab === "catalogue" ? "var(--color-text-primary)" : "var(--color-text-muted)",
              transition: "all var(--transition-fast)",
            }}
          >
            Catalogue ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "4px 12px",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              borderRadius: "var(--radius-xs)",
              backgroundColor: activeTab === "history" ? "var(--color-surface-raised)" : "transparent",
              color: activeTab === "history" ? "var(--color-text-primary)" : "var(--color-text-muted)",
              transition: "all var(--transition-fast)",
            }}
          >
            History ({redemptionHistory.length})
          </button>
        </div>
      </div>

      {activeTab === "catalogue" ? (
        /* Rewards Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {rewards.map((reward) => {
            const canAfford = (wallet?.coin_balance || 0) >= reward.coin_cost;

            return (
              <Card
                key={reward.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  border: canAfford ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid var(--color-border)",
                  transition: "transform var(--transition-fast), border-color var(--transition-fast)",
                }}
              >
                <div>
                  {/* Category & Cost Badge Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-surface-raised)",
                        color: "var(--color-gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getRewardIcon(reward.icon)}
                    </div>
                    <Badge variant="neutral" size="sm">
                      {reward.category}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h4
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {reward.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {reward.description}
                  </p>
                </div>

                {/* Footer: Value, Coins & Action */}
                <div
                  style={{
                    marginTop: "var(--space-4)",
                    paddingTop: "var(--space-3)",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Cost:
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: "var(--text-md)",
                        fontWeight: 700,
                        color: "var(--color-gold)",
                      }}
                    >
                      {reward.coin_cost.toLocaleString()} coins
                    </div>
                  </div>

                  <Button
                    variant={canAfford ? "gold" : "secondary"}
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleOpenRedeem(reward)}
                  >
                    {canAfford ? "Redeem" : "Need more coins"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Redemption History */
        <Card>
          {redemptionHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--color-text-muted)" }}>
              <History size={36} style={{ margin: "0 auto var(--space-2)" }} />
              <p>No reward redemptions yet. Redeem vouchers from the catalogue!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {redemptionHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-3)",
                    backgroundColor: "var(--color-surface-raised)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: "rgba(74, 222, 128, 0.15)",
                        color: "var(--color-success)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>
                        {item.reward_title}
                      </div>
                      <div className="font-mono" style={{ fontSize: "11px", color: "var(--color-gold)", marginTop: "2px" }}>
                        Code: {item.voucher_code}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="font-mono" style={{ color: "var(--color-gold)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                      - {item.coins_spent.toLocaleString()} coins
                    </div>
                    <div className="font-mono" style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                      {new Date(item.redeemed_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Confirmation Modal */}
      <RedemptionConfirmModal
        reward={selectedReward}
        wallet={wallet}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRedeem}
        isRedeeming={isRedeeming}
        error={redeemError}
      />

      {/* Success Modal */}
      <RedemptionSuccessModal
        receipt={lastReceipt}
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
};

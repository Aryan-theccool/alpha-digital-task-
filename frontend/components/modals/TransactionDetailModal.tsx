import React from "react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Transaction } from "../../types";
import { 
  CreditCard, 
  Calendar, 
  Tag, 
  Coins, 
  Building2, 
  Hash, 
  ArrowDownLeft, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!transaction) return null;

  const formattedDate = new Date(transaction.occurred_at).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: transaction.currency || "INR",
    maximumFractionDigits: 2,
  }).format(Math.abs(transaction.amount));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      description={`Reference ID: ${transaction.id}`}
      maxWidth="500px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Main Amount Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-5)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: transaction.is_refund
                ? "#c084fc"
                : transaction.status === "SUCCESS"
                ? "var(--color-success)"
                : transaction.status === "FAILED"
                ? "var(--color-danger)"
                : "var(--color-warning)",
              marginBottom: "var(--space-1)",
            }}
          >
            {transaction.is_refund ? (
              <ArrowDownLeft size={24} />
            ) : (
              <ArrowUpRight size={24} />
            )}
            <span
              className="font-mono"
              style={{
                fontSize: "var(--text-3xl)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {transaction.is_refund ? `+${formattedAmount}` : formattedAmount}
            </span>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Badge status={transaction.status} isRefund={transaction.is_refund} />
            <Badge variant="neutral">{transaction.category}</Badge>
          </div>
        </div>

        {/* Detailed Attribute Rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            backgroundColor: "var(--color-surface)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Merchant */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              <Building2 size={15} />
              <span>Merchant</span>
            </div>
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
              {transaction.merchant}
            </span>
          </div>

          {/* Payment Method */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              <CreditCard size={15} />
              <span>Payment Mode</span>
            </div>
            <span style={{ color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
              {transaction.payment_method}
            </span>
          </div>

          {/* Timestamp */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              <Calendar size={15} />
              <span>Date & Time</span>
            </div>
            <span className="font-mono" style={{ color: "var(--color-text-primary)", fontSize: "var(--text-xs)" }}>
              {formattedDate}
            </span>
          </div>

          {/* Transaction ID */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
              <Hash size={15} />
              <span>Ledger Ref ID</span>
            </div>
            <span className="font-mono" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
              {transaction.id}
            </span>
          </div>

          {/* Coins Earned */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "var(--space-2)",
              borderTop: "1px dashed var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-gold)", fontSize: "var(--text-sm)", fontWeight: 500 }}>
              <Coins size={15} />
              <span>Coins Earned</span>
            </div>
            <span
              className="font-mono"
              style={{
                color: transaction.coins_earned > 0 ? "var(--color-gold)" : "var(--color-text-muted)",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
              }}
            >
              {transaction.coins_earned > 0 ? `+${transaction.coins_earned} coins` : "0 coins"}
            </span>
          </div>
        </div>

        {/* Security & Verification Notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            justifyContent: "center",
          }}
        >
          <ShieldCheck size={14} color="var(--color-success)" />
          <span>Verified & logged in PostgreSQL ledger with ACID durability</span>
        </div>

        {/* Close Button */}
        <Button variant="secondary" onClick={onClose} style={{ width: "100%" }}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

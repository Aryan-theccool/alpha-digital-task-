export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  is_refund: boolean;
  coins_earned: number;
  occurred_at: string;
  category: string;
  category_id?: number | null;
  created_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TransactionsResponse {
  items: Transaction[];
  meta: PaginationMeta;
  categories: string[];
}

export interface CategorySpendItem {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface CategorySpendResponse {
  total_spend: number;
  total_transactions: number;
  data: CategorySpendItem[];
}

export interface MonthlyTrendItem {
  month_key: string;
  month_label: string;
  total_spend: number;
  transaction_count: number;
  coins_earned: number;
}

export interface MonthlyTrendResponse {
  data: MonthlyTrendItem[];
}

export interface Wallet {
  coin_balance: number;
  total_coins_earned: number;
  total_coins_redeemed: number;
  updated_at: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  category: string;
  coin_cost: number;
  voucher_value_inr: number;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface RedemptionReceipt {
  id: number;
  reward_id: number;
  reward_title: string;
  coins_spent: number;
  voucher_code: string;
  voucher_value_inr: number;
  redeemed_at: string;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  new_coin_balance: number;
  redemption: RedemptionReceipt;
}

export interface RedemptionHistoryItem {
  id: number;
  reward_title: string;
  voucher_value_inr: number;
  coins_spent: number;
  voucher_code: string;
  redeemed_at: string;
}

export interface TransactionFilterParams {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
  status?: string;
  payment_method?: string;
  min_amount?: number | string;
  max_amount?: number | string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AnalyticsSummary {
  total_transactions: number;
  successful_transactions: number;
  success_rate_percentage: number;
  total_spend_inr: number;
  average_ticket_inr: number;
  total_refunds_count: number;
  total_refunds_amount_inr: number;
  total_coins_earned: number;
}

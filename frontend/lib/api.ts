import {
  TransactionsResponse,
  Transaction,
  TransactionFilterParams,
  CategorySpendResponse,
  MonthlyTrendResponse,
  Wallet,
  Reward,
  RedeemResponse,
  RedemptionHistoryItem,
  AnalyticsSummary,
} from "../types";

// When running in browser, relative '/api' works seamlessly via Next.js rewrite / reverse proxy
const API_BASE = typeof window !== "undefined" 
  ? "" 
  : (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, "") : "http://127.0.0.1:8000");

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData: any = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === "string") {
        errorDetail = errorData.detail;
      } else if (typeof errorData?.detail?.message === "string") {
        errorDetail = errorData.detail.message;
      } else if (typeof errorData?.message === "string") {
        errorDetail = errorData.message;
      }
    } catch {
      // Non-JSON response
    }
    throw new ApiError(response.status, errorDetail, errorData);
  }

  return response.json();
}

export const api = {
  // Transactions
  getTransactions: async (params: TransactionFilterParams = {}): Promise<TransactionsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.page_size) searchParams.set("page_size", params.page_size.toString());
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.search && params.search.trim()) searchParams.set("search", params.search.trim());
    if (params.status && params.status !== "all") searchParams.set("status", params.status);
    if (params.payment_method && params.payment_method !== "all") searchParams.set("payment_method", params.payment_method);
    if (params.min_amount !== undefined && params.min_amount !== "") searchParams.set("min_amount", params.min_amount.toString());
    if (params.max_amount !== undefined && params.max_amount !== "") searchParams.set("max_amount", params.max_amount.toString());
    if (params.start_date) searchParams.set("start_date", params.start_date);
    if (params.end_date) searchParams.set("end_date", params.end_date);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);

    const query = searchParams.toString();
    return request<TransactionsResponse>(`/api/transactions${query ? `?${query}` : ""}`);
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    return request<Transaction>(`/api/transactions/${id}`);
  },

  getExportCsvUrl: (params: TransactionFilterParams = {}): string => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.search && params.search.trim()) searchParams.set("search", params.search.trim());
    if (params.status && params.status !== "all") searchParams.set("status", params.status);
    if (params.payment_method && params.payment_method !== "all") searchParams.set("payment_method", params.payment_method);
    if (params.min_amount !== undefined && params.min_amount !== "") searchParams.set("min_amount", params.min_amount.toString());
    if (params.max_amount !== undefined && params.max_amount !== "") searchParams.set("max_amount", params.max_amount.toString());
    if (params.start_date) searchParams.set("start_date", params.start_date);
    if (params.end_date) searchParams.set("end_date", params.end_date);
    const query = searchParams.toString();
    return `/api/transactions/export/csv${query ? `?${query}` : ""}`;
  },

  // Spend Analytics
  getSpendByCategory: async (params: Partial<TransactionFilterParams> = {}): Promise<CategorySpendResponse> => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);
    if (params.status && params.status !== "all") searchParams.set("status", params.status);
    if (params.min_amount !== undefined && params.min_amount !== "") searchParams.set("min_amount", params.min_amount.toString());
    if (params.max_amount !== undefined && params.max_amount !== "") searchParams.set("max_amount", params.max_amount.toString());
    if (params.start_date) searchParams.set("start_date", params.start_date);
    if (params.end_date) searchParams.set("end_date", params.end_date);

    const query = searchParams.toString();
    return request<CategorySpendResponse>(`/api/transactions/analytics/by-category${query ? `?${query}` : ""}`);
  },

  getMonthlyTrend: async (params: Partial<TransactionFilterParams> = {}): Promise<MonthlyTrendResponse> => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);
    if (params.status && params.status !== "all") searchParams.set("status", params.status);
    if (params.start_date) searchParams.set("start_date", params.start_date);
    if (params.end_date) searchParams.set("end_date", params.end_date);

    const query = searchParams.toString();
    return request<MonthlyTrendResponse>(`/api/transactions/analytics/monthly-trend${query ? `?${query}` : ""}`);
  },

  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    return request<AnalyticsSummary>("/api/transactions/analytics/summary");
  },

  // Wallet & Rewards
  getWallet: async (): Promise<Wallet> => {
    return request<Wallet>("/api/wallet");
  },

  getRewards: async (): Promise<Reward[]> => {
    return request<Reward[]>("/api/rewards");
  },

  redeemReward: async (rewardId: number): Promise<RedeemResponse> => {
    return request<RedeemResponse>("/api/rewards/redeem", {
      method: "POST",
      body: JSON.stringify({ reward_id: rewardId }),
    });
  },

  getRedemptionHistory: async (): Promise<RedemptionHistoryItem[]> => {
    return request<RedemptionHistoryItem[]>("/api/rewards/history");
  },
};

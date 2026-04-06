import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type AnalyticsSummary = {
  caYTD: number;
  expensesYTD: number;
  netProfit: number;
  margin: number;
  mrr: number;
  pendingInvoicesAmount: number;
  pendingInvoicesCount: number;
  clientCount: number;
  projectCount: number;
  urgentTaskCount: number;
  year: string;
};

export type RevenueTrendItem = {
  name: string;
  month: string;
  revenues: number;
  expenses: number;
  net: number;
};

export type ExpenseCategoryItem = {
  name: string;
  value: number;
};

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => {
      const res = await apiFetch("/api/analytics/summary");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch analytics summary`); }
      return res.json() as Promise<AnalyticsSummary>;
    },
  });
}

export function useRevenueTrend() {
  return useQuery({
    queryKey: ["analytics", "revenue-trend"],
    queryFn: async () => {
      const res = await apiFetch("/api/analytics/revenue-trend");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch revenue trend`); }
      return res.json() as Promise<RevenueTrendItem[]>;
    },
  });
}

export function useExpensesByCategory() {
  return useQuery({
    queryKey: ["analytics", "expenses-by-category"],
    queryFn: async () => {
      const res = await apiFetch("/api/analytics/expenses-by-category");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch expenses by category`); }
      return res.json() as Promise<ExpenseCategoryItem[]>;
    },
  });
}

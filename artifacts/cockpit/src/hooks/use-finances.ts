import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Transaction = {
  id: string;
  type: "revenue" | "expense";
  name: string;
  date: string;
  amount: number;
  category?: string;
};

export function useFinances() {
  return useQuery({
    queryKey: ["finances"],
    queryFn: async () => {
      const res = await apiFetch("/api/finances");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json() as Promise<Transaction[]>;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      const res = await apiFetch("/api/finances", {
        method: "POST",
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return res.json() as Promise<Transaction>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finances"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const res = await apiFetch(`/api/finances/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json() as Promise<Transaction>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finances"] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/finances/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finances"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Invoice = {
  id: string;
  ref: string;
  client: string;
  desc: string;
  amount: number;
  date: string;
  status: string;
  statusColor: "warning" | "danger" | "success";
};

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await apiFetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json() as Promise<Invoice[]>;
    },
  });
}

export function useAddInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      invoice: Omit<Invoice, "id" | "ref" | "status" | "statusColor">
    ) => {
      const res = await apiFetch("/api/invoices", {
        method: "POST",
        body: JSON.stringify(invoice),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      return res.json() as Promise<Invoice>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Invoice> & { id: string }) => {
      const res = await apiFetch(`/api/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update invoice");
      return res.json() as Promise<Invoice>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

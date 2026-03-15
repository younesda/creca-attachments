import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

let mockInvoices: Invoice[] = [
  { id: "1", ref: "FAC-2025-047", client: "Arcane Studio", desc: "Acompte Refonte", amount: 16000, date: "30 juillet", status: "En attente", statusColor: "warning" },
  { id: "2", ref: "FAC-2025-046", client: "NovaTech", desc: "Solde Phase 1", amount: 9250, date: "25 juillet", status: "En retard", statusColor: "danger" },
  { id: "3", ref: "FAC-2025-045", client: "Pixel Factory", desc: "SEO Juillet", amount: 1800, date: "20 juillet", status: "En attente", statusColor: "warning" },
  { id: "4", ref: "FAC-2025-044", client: "Studio K", desc: "Livraison finale", amount: 4100, date: "01 juillet", status: "Payée", statusColor: "success" },
  { id: "5", ref: "FAC-2025-043", client: "Orbis Digital", desc: "Campagne SM", amount: 4200, date: "28 juin", status: "Payée", statusColor: "success" },
  { id: "6", ref: "FAC-2025-042", client: "NovaTech", desc: "Acompte App Mobile", amount: 9250, date: "15 juin", status: "Payée", statusColor: "success" },
];

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => [...mockInvoices],
  });
}

export function useAddInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id" | "ref" | "status" | "statusColor">) => {
      const newInvoice: Invoice = {
        ...invoice,
        id: Math.random().toString(),
        ref: `FAC-2025-04${Math.floor(Math.random() * 10)}`,
        status: "En attente",
        statusColor: "warning",
      };
      mockInvoices = [newInvoice, ...mockInvoices];
      return newInvoice;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Transaction = {
  id: string;
  type: "revenue" | "expense";
  name: string;
  date: string;
  amount: number;
  category?: string;
};

let mockTransactions: Transaction[] = [
  { id: "1", type: "revenue", name: "Acompte Arcane — Refonte", date: "15 juillet 2025", amount: 16000 },
  { id: "2", type: "revenue", name: "Solde NovaTech — Phase 1", date: "12 juillet 2025", amount: 9250 },
  { id: "3", type: "revenue", name: "Mensuel Pixel Factory — SEO", date: "10 juillet 2025", amount: 1800 },
  { id: "4", type: "revenue", name: "Livraison finale Studio K", date: "01 juillet 2025", amount: 4100 },
  { id: "5", type: "expense", name: "Adobe Creative Cloud", date: "01 juillet 2025", category: "Logiciels", amount: 89 },
  { id: "6", type: "expense", name: "Hébergement serveurs", date: "05 juillet 2025", category: "Infrastructure", amount: 340 },
  { id: "7", type: "expense", name: "Sous-traitant design — Arcane", date: "08 juillet 2025", category: "Personnel", amount: 2400 },
  { id: "8", type: "expense", name: "Formation UX Research", date: "10 juillet 2025", category: "Formation", amount: 490 },
];

export function useFinances() {
  return useQuery({
    queryKey: ["finances"],
    queryFn: async () => [...mockTransactions],
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      const newTx: Transaction = { ...transaction, id: Math.random().toString() };
      mockTransactions = [newTx, ...mockTransactions];
      return newTx;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finances"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Client = {
  id: string;
  initials: string;
  name: string;
  sector: string;
  email: string;
  phone: string;
  city: string;
  statusText: string;
  statusColor: "info" | "warning" | "success" | "primary" | "danger";
  revenue: number | null;
  gradient: string;
};

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await apiFetch("/api/clients");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch clients`); }
      return res.json() as Promise<Client[]>;
    },
  });
}

export function useAddClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      client: Omit<Client, "id" | "initials" | "gradient" | "statusText" | "statusColor" | "revenue">
    ) => {
      const res = await apiFetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(client),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Erreur ${res.status}`);
      }
      return res.json() as Promise<Client>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Client> & { id: string }) => {
      const res = await apiFetch(`/api/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — update client`); }
      return res.json() as Promise<Client>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — delete client`); }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

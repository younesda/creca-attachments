import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Project = {
  id: string;
  name: string;
  client: string;
  budget: number;
  dates: string;
  status: string;
  statusColor: "info" | "warning" | "success" | "muted";
  progress: number;
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await apiFetch("/api/projects");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch projects`); }
      return res.json() as Promise<Project[]>;
    },
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      project: Omit<Project, "id" | "status" | "statusColor" | "progress">
    ) => {
      const res = await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(project),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — create project`); }
      return res.json() as Promise<Project>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: string }) => {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — update project`); }
      return res.json() as Promise<Project>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — delete project`); }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

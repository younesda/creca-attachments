import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { throwApiError } from "@/lib/api-error";

export type Task = {
  id: string;
  name: string;
  date: string;
  priority: string;
  priorityColor: "danger" | "warning" | "info" | "primary";
  status: "todo" | "in_progress" | "done";
};

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await apiFetch("/api/tasks");
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — fetch tasks`); }
      return res.json() as Promise<Task[]>;
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — toggle task`); }
      return res.json() as Promise<Task>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<Task, "id" | "status">) => {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      });
      if (!res.ok) await throwApiError(res, "create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — update task`); }
      return res.json() as Promise<Task>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Erreur ${res.status} — delete task`); }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

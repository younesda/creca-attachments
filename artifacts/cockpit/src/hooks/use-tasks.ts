import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Task = {
  id: string;
  name: string;
  date: string;
  priority: string;
  priorityColor: "danger" | "warning" | "info" | "primary";
  status: "todo" | "in_progress" | "done";
};

let mockTasks: Task[] = [
  { id: "1", name: "Envoyer devis à Lumière Collective", date: "Aujourd'hui", priority: "Urgent", priorityColor: "danger", status: "todo" },
  { id: "2", name: "Réviser contrat Arcane v2.1", date: "Demain", priority: "Haute priorité", priorityColor: "warning", status: "todo" },
  { id: "3", name: "Facturer Studio K livrables finaux", date: "Vendredi", priority: "Normal", priorityColor: "info", status: "todo" },
  { id: "4", name: "Mettre à jour portfolio 2025", date: "Cette semaine", priority: "Normal", priorityColor: "info", status: "todo" },
  { id: "5", name: "Réunion bilan mensuel", date: "30 juillet", priority: "Normal", priorityColor: "info", status: "todo" },
  { id: "6", name: "Maquettes App Mobile NovaTech v3", date: "En cours", priority: "Design", priorityColor: "info", status: "in_progress" },
  { id: "7", name: "Rédaction stratégie SEO Q3", date: "En cours", priority: "SEO", priorityColor: "warning", status: "in_progress" },
  { id: "8", name: "Analyse concurrentielle Arcane", date: "En cours", priority: "Recherche", priorityColor: "primary", status: "in_progress" },
  { id: "9", name: "Configuration Analytics Studio K", date: "En cours", priority: "Dev", priorityColor: "info", status: "in_progress" },
  { id: "10", name: "Appel client NovaTech", date: "Hier", priority: "Terminé", priorityColor: "success" as any, status: "done" },
  { id: "11", name: "Livraison branding Studio K", date: "30 juin", priority: "Terminé", priorityColor: "success" as any, status: "done" },
  { id: "12", name: "Publication rapport mensuel", date: "1er juillet", priority: "Terminé", priorityColor: "success" as any, status: "done" },
];

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => [...mockTasks],
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      mockTasks = mockTasks.map(t => 
        t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
      );
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<Task, "id" | "status">) => {
      const newTask: Task = { ...task, id: Math.random().toString(), status: "todo" };
      mockTasks = [newTask, ...mockTasks];
      return newTask;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

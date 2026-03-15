import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

let mockProjects: Project[] = [
  { id: "1", name: "Refonte Digitale – Arcane", client: "Arcane Studio", budget: 32000, dates: "01/06 → 31/08", status: "En cours", statusColor: "info", progress: 68 },
  { id: "2", name: "App Mobile – NovaTech", client: "NovaTech", budget: 18500, dates: "15/06 → 30/09", status: "En cours", statusColor: "warning", progress: 42 },
  { id: "3", name: "Stratégie SEO Q3 – Pixel Factory", client: "Pixel Factory", budget: 5400, dates: "01/07 → 30/09", status: "En cours", statusColor: "warning", progress: 55 },
  { id: "4", name: "Branding complet – Studio K", client: "Studio K", budget: 8200, dates: "01/04 → 30/06", status: "Terminé", statusColor: "success", progress: 100 },
  { id: "5", name: "Campagne Social Media – Orbis", client: "Orbis Digital", budget: 4200, dates: "01/05 → 31/05", status: "Terminé", statusColor: "success", progress: 100 },
  { id: "6", name: "Audit UX – Fenix Labs", client: "Fenix Labs", budget: 6800, dates: "01/07 → —", status: "En pause", statusColor: "muted", progress: 25 },
];

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => [...mockProjects],
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Omit<Project, "id" | "status" | "statusColor" | "progress">) => {
      const newProject: Project = {
        ...project,
        id: Math.random().toString(),
        status: "Nouveau",
        statusColor: "info",
        progress: 0,
      };
      mockProjects = [newProject, ...mockProjects];
      return newProject;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

let mockClients: Client[] = [
  { id: "1", initials: "AR", name: "Arcane Studio", sector: "Design & Branding", email: "contact@arcane-studio.fr", phone: "+33 6 12 34 56 78", city: "Paris, France", statusText: "2 projets actifs", statusColor: "info", revenue: 32000, gradient: "from-[#7C3AED] to-[#9333EA]" },
  { id: "2", initials: "NT", name: "NovaTech", sector: "Développement logiciel", email: "ceo@novatech.io", phone: "+33 7 98 76 54 32", city: "Lyon, France", statusText: "1 projet en cours", statusColor: "warning", revenue: 18500, gradient: "from-[#3B82F6] to-[#60A5FA]" },
  { id: "3", initials: "SK", name: "Studio K", sector: "Communication", email: "hello@studiok.co", phone: "+33 6 55 44 33 22", city: "Bordeaux, France", statusText: "Projet terminé", statusColor: "success", revenue: 8200, gradient: "from-[#22C55E] to-[#4ADE80]" },
  { id: "4", initials: "PF", name: "Pixel Factory", sector: "E-commerce", email: "info@pixel-factory.fr", phone: "+33 6 11 22 33 44", city: "Marseille, France", statusText: "1 projet en cours", statusColor: "warning", revenue: 5400, gradient: "from-[#F59E0B] to-[#FBBF24]" },
  { id: "5", initials: "LC", name: "Lumière Collective", sector: "Événementiel", email: "contact@lumiere.co", phone: "+33 7 66 55 44 33", city: "Nantes, France", statusText: "Prospect", statusColor: "primary", revenue: null, gradient: "from-[#EF4444] to-[#F87171]" },
];

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => [...mockClients],
  });
}

export function useAddClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: Omit<Client, "id" | "initials" | "gradient" | "statusText" | "statusColor" | "revenue">) => {
      const newClient: Client = {
        ...client,
        id: Math.random().toString(),
        initials: client.name.substring(0, 2).toUpperCase(),
        gradient: "from-gray-600 to-gray-400",
        statusText: "Nouveau",
        statusColor: "info",
        revenue: 0,
      };
      mockClients = [newClient, ...mockClients];
      return newClient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

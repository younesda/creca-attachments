import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Profile = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  rccm: string;
  taxId: string;
  website: string;
  onboardingCompleted: boolean;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await apiFetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<Profile | null>;
    },
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      return res.json() as Promise<Profile>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

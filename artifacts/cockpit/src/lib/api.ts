import { supabase } from "./supabase";

/**
 * Retourne les headers d'authentification pour les appels API.
 * À utiliser dans tous les hooks React Query.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

/**
 * fetch authentifié — wrapper autour de fetch standard.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> ?? {}),
    },
  });
}

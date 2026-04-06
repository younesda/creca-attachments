import { supabase } from "./supabase";

// En développement : proxy Vite → pas de base URL nécessaire
// En production : VITE_API_URL pointe vers le backend (ex: https://api.monapp.com)
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> ?? {}),
    },
  });
}

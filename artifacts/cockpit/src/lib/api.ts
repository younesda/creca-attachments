import { supabase } from "./supabase";

// En dev : proxy Vite (vite.config.ts) redirige /api → localhost:3001
// En prod : proxy Vercel (vercel.json) redirige /api → Render
const API_BASE = "";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

async function getRefreshedHeaders(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.refreshSession();
  if (!session?.access_token) return null;
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  // Token expiré → on rafraîchit et on réessaie une fois
  if (res.status === 401) {
    const refreshed = await getRefreshedHeaders();
    if (refreshed) {
      return fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...refreshed,
          ...(options.headers as Record<string, string> ?? {}),
        },
      });
    }
  }

  return res;
}

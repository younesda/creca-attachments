import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function useUpgrade() {
  const [loading, setLoading] = useState<"pro" | "business" | null>(null);

  async function upgrade(plan: "pro" | "business") {
    setLoading(plan);
    try {
      const res = await apiFetch("/api/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Upgrade error:", err);
      alert(err.message ?? "Impossible de démarrer le paiement. Réessayez.");
      setLoading(null);
    }
  }

  return { upgrade, loading };
}

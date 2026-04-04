import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";

type Plan = "free" | "pro" | "business";
type Tab = "login" | "register";

const PLANS: { id: Plan; label: string; price: string; color: string; features: string[] }[] = [
  {
    id: "free",
    label: "Free",
    price: "0€",
    color: "border-border",
    features: ["1 client actif", "1 projet simultané", "5 factures/mois"],
  },
  {
    id: "pro",
    label: "Pro",
    price: "29€",
    color: "border-primary shadow-lg shadow-primary/20",
    features: ["Tout illimité", "Analytics complets", "✦ IA incluse"],
  },
  {
    id: "business",
    label: "Business",
    price: "79€",
    color: "border-amber-500/60",
    features: ["Tout Pro", "10 collaborateurs", "✦ IA avancée"],
  },
];

const PLAN_BADGE: Record<Plan, string> = {
  free: "text-muted-foreground",
  pro: "text-primary",
  business: "text-amber-400",
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("free");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) setLocation("/app");
  }, [user, loading]);

  // Pre-select plan from URL param (?plan=pro)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan") as Plan | null;
    if (p && ["free", "pro", "business"].includes(p)) {
      setSelectedPlan(p);
      setTab("register");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else setLocation("/app");
    setSubmitting(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, plan: selectedPlan },
      },
    });
    if (error) setError(error.message);
    else setLocation("/app");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-[#0D0D15] border-r border-border relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)]" />
            Cockpit
          </a>
        </div>
        <div className="relative z-10">
          <blockquote className="text-2xl font-display font-bold leading-relaxed mb-4">
            "Pilotez toute votre entreprise depuis un seul endroit."
          </blockquote>
          <div className="flex flex-col gap-3 mt-8">
            {[
              "Finances & comptabilité en temps réel",
              "CRM clients et suivi de projets",
              "Facturation automatisée",
              "Analytics et prévisions IA",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground relative z-10">© 2025 Cockpit. Tous droits réservés.</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <a href="/" className="lg:hidden flex items-center gap-2 font-display font-bold text-xl mb-8">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)]" />
            Cockpit
          </a>

          {/* Tabs */}
          <div className="flex bg-card border border-border rounded-xl p-1 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>

          {/* Plan selector — register only */}
          {tab === "register" && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Choisissez votre plan</p>
              <div className="grid grid-cols-3 gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`border-2 rounded-xl p-3 text-left transition-all ${
                      selectedPlan === p.id
                        ? p.color + " bg-primary/5"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className={`text-xs font-bold mb-1 ${selectedPlan === p.id ? PLAN_BADGE[p.id] : "text-muted-foreground"}`}>
                      {p.label}
                    </div>
                    <div className="text-sm font-display font-bold">{p.price}<span className="text-[10px] text-muted-foreground font-normal">/mois</span></div>
                    <ul className="mt-2 space-y-1">
                      {p.features.slice(0, 2).map((f, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-primary flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.fr"
                required
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === "login" ? "Se connecter" : `Créer mon compte — ${selectedPlan}`}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === "login" ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => { setTab("register"); setError(""); }} className="text-primary hover:underline">
                  S'inscrire gratuitement
                </button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button onClick={() => { setTab("login"); setError(""); }} className="text-primary hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

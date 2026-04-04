import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Plan = "free" | "pro" | "business";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  plan: Plan;
  displayName: string;
  initials: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const plan: Plan = (user?.user_metadata?.plan as Plan) ?? "free";

  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "";
  const displayName = fullName || "Utilisateur";

  const initials = fullName
    ? fullName.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "?").toUpperCase();

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, plan, displayName, initials, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

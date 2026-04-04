import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Sparkles } from "lucide-react";

type Plan = "free" | "pro" | "business";

const PLAN_ORDER: Record<Plan, number> = { free: 0, pro: 1, business: 2 };
const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro", business: "Business" };

interface PlanGateProps {
  required: Plan;
  children: React.ReactNode;
}

export function PlanGate({ required, children }: PlanGateProps) {
  const { plan } = useAuth();
  const [, setLocation] = useLocation();

  if (PLAN_ORDER[plan] >= PLAN_ORDER[required]) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-3">
          Fonctionnalité {PLAN_LABELS[required]}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Cette fonctionnalité est réservée au plan{" "}
          <span className="text-primary font-semibold">{PLAN_LABELS[required]}</span>
          {required === "business" ? " et supérieur" : " et supérieur"}.
          Passez à la version supérieure pour en profiter.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Passer au plan {PLAN_LABELS[required]}
        </button>
      </div>
    </div>
  );
}

import { Request, Response, NextFunction } from "express";
import type { Plan } from "./auth";

const PLAN_ORDER: Record<Plan, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

export function requirePlan(minPlan: Plan) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userPlan = req.user?.plan ?? "free";

    if (PLAN_ORDER[userPlan] < PLAN_ORDER[minPlan]) {
      res.status(403).json({
        error: `Cette fonctionnalité nécessite le plan ${minPlan}.`,
        requiredPlan: minPlan,
        currentPlan: userPlan,
      });
      return;
    }

    next();
  };
}

// ─── Limites par plan (source de vérité serveur) ─────────────────────────────

export const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
  free:     { clients: 1,        projects: 1,        tasks: 20,       invoices: 5       },
  pro:      { clients: Infinity, projects: Infinity, tasks: Infinity, invoices: Infinity },
  business: { clients: Infinity, projects: Infinity, tasks: Infinity, invoices: Infinity },
};

export function isAtLimit(plan: Plan, resource: string, count: number): boolean {
  return count >= (PLAN_LIMITS[plan][resource] ?? Infinity);
}

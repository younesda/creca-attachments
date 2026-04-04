export const PLAN_LIMITS = {
  free:     { clients: 1,        projects: 1,        tasks: 20,       invoices: 5       },
  pro:      { clients: Infinity, projects: Infinity, tasks: Infinity, invoices: Infinity },
  business: { clients: Infinity, projects: Infinity, tasks: Infinity, invoices: Infinity },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function isAtLimit(plan: PlanName, resource: keyof typeof PLAN_LIMITS.free, count: number) {
  return count >= PLAN_LIMITS[plan][resource];
}

import React, { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Progress } from "@/components/UI";
import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useClients } from "@/hooks/use-clients";
import { useFinances } from "@/hooks/use-finances";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpRight, ArrowDownRight, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const MONTH_LABELS: Record<string, string> = {
  "0": "Jan", "1": "Fév", "2": "Mar", "3": "Avr",
  "4": "Mai", "5": "Juin", "6": "Juil", "7": "Août",
  "8": "Sep", "9": "Oct", "10": "Nov", "11": "Déc",
};

export default function Dashboard() {
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { data: transactions = [] } = useFinances();
  const { user } = useAuth();
  const toggleTask = useToggleTask();

  const revenues = transactions.filter(t => t.type === "revenue");
  const expenses = transactions.filter(t => t.type === "expense");
  const totalRev = revenues.reduce((acc, t) => acc + t.amount, 0);
  const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRev - totalExp;

  const activeProjects = projects.filter(p => p.status === "En cours");
  const urgentTasksAll = tasks.filter(t => t.priorityColor === "danger" && t.status !== "done");

  // Build monthly revenue chart from real transactions
  const revenueData = useMemo(() => {
    const now = new Date();
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = 0;
    }
    revenues.forEach(t => {
      // On préfère createdAt (ISO, toujours parsable) ; date est un texte libre non fiable
      const raw = (t as any).createdAt;
      const d = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in months) months[key] = (months[key] ?? 0) + t.amount;
    });
    return Object.entries(months).map(([key, val]) => ({
      name: MONTH_LABELS[key.split("-")[1]] ?? key,
      val,
    }));
  }, [revenues]);

  const urgentTasks = urgentTasksAll.slice(0, 4);
  const recentProjects = projects.slice(0, 4);

  const displayName = user?.email?.split("@")[0] ?? "vous";

  const statusCounts = {
    en_cours: projects.filter(p => p.status === "En cours").length,
    termines: projects.filter(p => p.status === "Terminé").length,
    pause: projects.filter(p => p.status === "En pause").length,
    urgents: urgentTasksAll.length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={`Bonjour ${displayName} — Voici votre résumé du jour`}
      >
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Chiffre d'affaires</div>
              <div className="text-xl font-mono font-semibold mb-1">{formatCurrency(totalRev)}</div>
              <div className="text-xs text-success flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Total cumulé
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Dépenses</div>
              <div className="text-xl font-mono font-semibold mb-1">{formatCurrency(totalExp)}</div>
              <div className="text-xs text-danger flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Total cumulé
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Profit net</div>
              <div className={`text-xl font-mono font-semibold mb-1 ${netProfit >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(netProfit)}
              </div>
              <div className={`text-xs flex items-center gap-1 ${netProfit >= 0 ? "text-success" : "text-danger"}`}>
                {netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                Revenus − Dépenses
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Clients actifs</div>
              <div className="text-xl font-mono font-semibold mb-1">{clients.length}</div>
              <div className="text-xs text-info flex items-center gap-1">au total</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Projets en cours</div>
              <div className="text-xl font-mono font-semibold mb-1">{activeProjects.length}</div>
              {urgentTasksAll.length > 0 ? (
                <Badge variant="warning" className="mt-1">{urgentTasksAll.length} urgent{urgentTasksAll.length > 1 ? "s" : ""}</Badge>
              ) : (
                <div className="text-xs text-muted-foreground mt-1">Aucune urgence</div>
              )}
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-sm">Évolution des revenus</h3>
                  <p className="text-xs text-muted-foreground">6 derniers mois</p>
                </div>
              </div>
              <div className="flex-1 min-h-[200px]">
                {revenueData.every(d => d.val === 0) ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Aucune transaction enregistrée
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} barSize={32}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "#1E1E2A" }}
                        contentStyle={{ backgroundColor: "#121218", borderColor: "#1E1E2A", borderRadius: "8px" }}
                        formatter={(v: number) => [formatCurrency(v), "Revenus"]}
                      />
                      <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? "#7C3AED" : "rgba(124,58,237,0.3)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-4">Projets</h3>
              <div className="space-y-4 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En cours</span>
                  <span className="text-info font-mono">{statusCounts.en_cours}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Terminés</span>
                  <span className="text-success font-mono">{statusCounts.termines}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En pause</span>
                  <span className="text-warning font-mono">{statusCounts.pause}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Urgents</span>
                  <span className="text-danger font-mono">{statusCounts.urgents}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
            <Card className="flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                <h3 className="font-semibold text-sm">Projets récents</h3>
                <Link href="/app/projects" className="text-xs text-muted-foreground hover:text-foreground">Voir tout →</Link>
              </div>
              <div className="p-0 overflow-x-auto">
                {recentProjects.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Aucun projet</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                      <tr>
                        <th className="px-5 py-3 font-medium">Projet</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                        <th className="px-5 py-3 font-medium">Avancement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentProjects.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4 font-medium text-foreground">{p.name}</td>
                          <td className="px-5 py-4">
                            <Badge variant={p.statusColor}>{p.status}</Badge>
                          </td>
                          <td className="px-5 py-4 w-1/3">
                            <Progress value={p.progress} color={`var(--color-${p.statusColor})`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            <Card className="flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                <h3 className="font-semibold text-sm">Tâches urgentes</h3>
                <Link href="/app/tasks" className="text-xs text-muted-foreground hover:text-foreground">Voir tout →</Link>
              </div>
              <div className="p-0 flex flex-col divide-y divide-border/50">
                {urgentTasks.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Aucune tâche urgente</div>
                ) : urgentTasks.map(t => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleTask.mutate(t.id)}
                  >
                    <div className={cn(
                      "mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors",
                      t.status === "done" ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {t.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "text-sm mb-1 transition-colors",
                        t.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {t.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">📅 {t.date}</span>
                        <Badge variant={t.priorityColor}>{t.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

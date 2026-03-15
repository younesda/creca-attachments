import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageHeader, AppShell } from "@/components/Layout";
import { Card, Badge, Button, Input, Progress } from "@/components/UI";
import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { Sparkles, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const revenueData = [
  { name: "Jan", val: 12000 }, { name: "Fév", val: 18000 }, { name: "Mar", val: 15000 },
  { name: "Avr", val: 24000 }, { name: "Mai", val: 21000 }, { name: "Juin", val: 32000 },
  { name: "Juil", val: 45000 },
];

export default function Dashboard() {
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const toggleTask = useToggleTask();

  const urgentTasks = tasks.filter(t => t.priorityColor === "danger" || t.priorityColor === "warning" || t.date === "Aujourd'hui").slice(0, 4);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Dashboard" subtitle="Bonjour Thomas 👋 — Voici votre résumé du jour">
        <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5 w-64">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground" placeholder="Rechercher..." />
        </div>
        <Button variant="outline" className="w-9 h-9 p-0 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </Button>
        <Button className="gap-2"><Plus className="w-4 h-4"/> Nouveau</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-6">
          
          {/* AI Panel */}
          <div className="bg-[#0D0B18] border border-primary/20 rounded-xl p-5 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[#C4B5FD]">Analyse IA · Ce mois-ci</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vos revenus sont en <strong className="text-foreground">hausse de 12.4%</strong> par rapport au mois dernier. Le projet <strong className="text-foreground">Refonte Digitale – Arcane</strong> représente 38% de votre CA. 3 factures sont en attente de paiement pour un total de <strong className="text-foreground">14 800 €</strong>. Je recommande de relancer Novae Studio et Pixel Factory avant le 20.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="primary" className="cursor-pointer bg-primary/10 border border-primary/20 hover:bg-primary/20">📊 Voir les finances</Badge>
              <Badge variant="primary" className="cursor-pointer bg-primary/10 border border-primary/20 hover:bg-primary/20">🧾 Factures en attente</Badge>
              <Badge variant="primary" className="cursor-pointer bg-primary/10 border border-primary/20 hover:bg-primary/20">📈 Prévision Q4</Badge>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">💶 Chiffre d'affaires</div>
              <div className="text-xl font-mono font-semibold mb-1">{formatCurrency(84500)}</div>
              <div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +12.4%</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">📉 Dépenses</div>
              <div className="text-xl font-mono font-semibold mb-1">{formatCurrency(23100)}</div>
              <div className="text-xs text-danger flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +3.2%</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">✨ Profit net</div>
              <div className="text-xl font-mono font-semibold text-success mb-1">{formatCurrency(61400)}</div>
              <div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +18.7%</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">👥 Clients actifs</div>
              <div className="text-xl font-mono font-semibold mb-1">24</div>
              <div className="text-xs text-info flex items-center gap-1">+3 ce mois</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">📁 Projets en cours</div>
              <div className="text-xl font-mono font-semibold mb-1">8</div>
              <Badge variant="warning" className="mt-1">3 urgents</Badge>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-sm">Évolution des revenus</h3>
                  <p className="text-xs text-muted-foreground">Janvier – Juillet 2025</p>
                </div>
                <select className="bg-background border border-border rounded-md text-xs px-2 py-1 text-muted-foreground">
                  <option>Cette année</option>
                </select>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barSize={32}>
                    <Tooltip cursor={{fill: '#1E1E2A'}} contentStyle={{backgroundColor: '#121218', borderColor: '#1E1E2A', borderRadius: '8px'}} />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#7C3AED' : 'rgba(124,58,237,0.3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-4">Projets</h3>
              <div className="space-y-4 mt-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">En cours</span><span className="text-info font-mono">8</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Terminés</span><span className="text-success font-mono">14</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">En pause</span><span className="text-warning font-mono">2</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Urgents</span><span className="text-danger font-mono">3</span></div>
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
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                    <tr><th className="px-5 py-3 font-medium">Projet</th><th className="px-5 py-3 font-medium">Statut</th><th className="px-5 py-3 font-medium">Avancement</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentProjects.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-medium text-foreground">{p.name}</td>
                        <td className="px-5 py-4"><Badge variant={p.statusColor}>{p.status}</Badge></td>
                        <td className="px-5 py-4 w-1/3">
                          <Progress value={p.progress} color={`var(--color-${p.statusColor})`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-border/50">
                <h3 className="font-semibold text-sm">Tâches urgentes</h3>
                <Link href="/app/tasks" className="text-xs text-muted-foreground hover:text-foreground">Voir tout →</Link>
              </div>
              <div className="p-0 flex flex-col divide-y divide-border/50">
                {urgentTasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleTask.mutate(t.id)}>
                    <div className={cn("mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors", t.status === "done" ? "bg-primary border-primary" : "border-muted-foreground")}>
                      {t.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className={cn("text-sm mb-1 transition-colors", t.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>{t.name}</div>
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

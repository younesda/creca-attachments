import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card } from "@/components/UI";
import { PlanGate } from "@/components/PlanGate";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpRight, ArrowDownRight, Download, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAnalyticsSummary, useRevenueTrend, useExpensesByCategory } from "@/hooks/use-analytics";

const COLORS = ["#7C3AED", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

function AnalyticsContent() {
  const { plan } = useAuth();
  const { toast } = useToast();
  const isBusinessPlan = plan === "business";

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: revenueTrend, isLoading: trendLoading } = useRevenueTrend();
  const { data: expensesByCategory, isLoading: expensesLoading } = useExpensesByCategory();

  const isLoading = summaryLoading || trendLoading || expensesLoading;

  const marginDelta = summary ? (summary.margin >= 0 ? "+" : "") + summary.margin.toFixed(1) + "%" : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Analytics"
        subtitle={`Performance globale · ${summary?.year ?? new Date().getFullYear()} YTD`}
      >
        {isBusinessPlan && (
          <button
            onClick={() => toast({ title: "Export données généré", description: "CSV téléchargé." })}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:border-amber-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Exporter
          </button>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* KPIs */}
          <div className={`grid gap-4 ${isBusinessPlan ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 md:grid-cols-3"}`}>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">CA YTD</div>
              <div className="text-xl font-mono font-semibold mb-1">
                {isLoading ? "—" : formatCurrency(summary?.caYTD ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">Revenus cumulés</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Taux de marge</div>
              <div className="text-xl font-mono font-semibold mb-1">
                {isLoading ? "—" : `${summary?.margin.toFixed(1) ?? 0}%`}
              </div>
              {marginDelta && (
                <div className={`text-xs flex items-center gap-1 ${(summary?.margin ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {(summary?.margin ?? 0) >= 0
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />
                  }
                  {marginDelta}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">MRR Estimé</div>
              <div className="text-xl font-mono font-semibold mb-1">
                {isLoading ? "—" : formatCurrency(summary?.mrr ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">Moy. 3 derniers mois</div>
            </Card>

            {isBusinessPlan && (
              <>
                <Card className="p-4 border-amber-500/20">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Bénéfice net</div>
                  <div className="text-xl font-mono font-semibold mb-1">
                    {isLoading ? "—" : formatCurrency(summary?.netProfit ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">CA − Dépenses</div>
                </Card>
                <Card className="p-4 border-amber-500/20">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Factures en attente</div>
                  <div className="text-xl font-mono font-semibold mb-1">
                    {isLoading ? "—" : formatCurrency(summary?.pendingInvoicesAmount ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">{summary?.pendingInvoicesCount ?? 0} facture(s)</div>
                </Card>
              </>
            )}
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-sm mb-6">Évolution mensuelle</h3>
              <div className="h-[280px]">
                {trendLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Chargement...</div>
                ) : !revenueTrend || revenueTrend.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <TrendingUp className="w-8 h-8 opacity-30" />
                    <p>Aucune transaction encore</p>
                    <p className="text-xs">Ajoutez des revenus dans l'onglet Finances</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueTrend}>
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "#1E1E2A" }}
                        contentStyle={{ backgroundColor: "#121218", borderColor: "#1E1E2A", borderRadius: "8px" }}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                      <Bar dataKey="revenues" name="Revenus" radius={[4, 4, 0, 0]}>
                        {revenueTrend.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === revenueTrend.length - 1 ? "#7C3AED" : "rgba(124,58,237,0.35)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-sm mb-6">Répartition des dépenses</h3>
              <div className="h-[280px]">
                {expensesLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Chargement...</div>
                ) : !expensesByCategory || expensesByCategory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <Download className="w-8 h-8 opacity-30" />
                    <p>Aucune dépense enregistrée</p>
                    <p className="text-xs">Ajoutez des dépenses catégorisées dans Finances</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {expensesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#121218", borderColor: "#1E1E2A", borderRadius: "8px" }}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Section Business — Résumé financier détaillé */}
          {isBusinessPlan && summary && (
            <Card className="p-6 border-amber-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm">Bilan financier détaillé</h3>
                <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-1 rounded-full font-medium">
                  ✦ Business
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Revenus</p>
                  <p className="font-mono font-semibold text-green-400">{formatCurrency(summary.caYTD)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dépenses</p>
                  <p className="font-mono font-semibold text-red-400">{formatCurrency(summary.expensesYTD)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bénéfice net</p>
                  <p className={`font-mono font-semibold ${summary.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(summary.netProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Clients actifs</p>
                  <p className="font-mono font-semibold">{summary.clientCount}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <PlanGate required="pro">
      <AnalyticsContent />
    </PlanGate>
  );
}

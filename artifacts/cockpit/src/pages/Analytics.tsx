import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card } from "@/components/UI";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const revenueData = [
  { name: "Jan", val: 12000 }, { name: "Fév", val: 18000 }, { name: "Mar", val: 15000 },
  { name: "Avr", val: 24000 }, { name: "Mai", val: 21000 }, { name: "Juin", val: 32000 },
  { name: "Juil", val: 45000 },
];

const expenseData = [
  { name: "Logiciels", value: 1200 },
  { name: "Personnel", value: 15400 },
  { name: "Infrastructure", value: 2500 },
  { name: "Marketing", value: 4000 },
];
const COLORS = ['#7C3AED', '#3B82F6', '#22C55E', '#F59E0B'];

export default function Analytics() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Analytics" subtitle="Performance globale · Janvier – Juillet 2025">
        <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer text-foreground">
          <option>2025 YTD</option>
          <option>Q2 2025</option>
        </select>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-6">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">📊 CA YTD</div><div className="text-xl font-mono font-semibold mb-1">{formatCurrency(84500)}</div><div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +22%</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">💎 Taux de marge</div><div className="text-xl font-mono font-semibold mb-1">72.7%</div><div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +4.1 pts</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">🎯 MRR Actuel</div><div className="text-xl font-mono font-semibold mb-1">{formatCurrency(12400)}</div><div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +15%</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">🤝 LTV Client Moy.</div><div className="text-xl font-mono font-semibold mb-1">{formatCurrency(18500)}</div><div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +8%</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">⚡ Taux Conv.</div><div className="text-xl font-mono font-semibold mb-1">68%</div><div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +5 pts</div></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-sm mb-6">Évolution mensuelle</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
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

            <Card className="p-6">
              <h3 className="font-semibold text-sm mb-6">Répartition des dépenses</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#121218', borderColor: '#1E1E2A', borderRadius: '8px'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

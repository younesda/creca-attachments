import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Button, Input, Modal, Label } from "@/components/UI";
import { useFinances, useAddTransaction } from "@/hooks/use-finances";
import { Plus, ArrowUpRight, ArrowDownRight, Euro, UploadCloud } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Finances() {
  const { data: transactions = [] } = useFinances();
  const addTx = useAddTransaction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "revenue", name: "", amount: "", date: "Aujourd'hui" });

  const revenues = transactions.filter(t => t.type === 'revenue');
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const totalRev = revenues.reduce((acc, t) => acc + t.amount, 0);
  const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRev - totalExp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTx.mutate({ ...formData, amount: Number(formData.amount), type: formData.type as any }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ type: "revenue", name: "", amount: "", date: "Aujourd'hui" });
      }
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Finances" subtitle={`Juillet 2025 · Profit net : ${formatCurrency(netProfit)}`}>
        <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer text-foreground">
          <option>Juillet 2025</option>
          <option>Juin 2025</option>
        </select>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4"/> Ajouter</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-6">
          
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">💶 Revenus</div>
              <div className="text-2xl font-mono font-bold text-success mb-1">{formatCurrency(totalRev)}</div>
              <div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +12.4% vs juin</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">📉 Dépenses</div>
              <div className="text-2xl font-mono font-bold text-danger mb-1">{formatCurrency(totalExp)}</div>
              <div className="text-xs text-danger flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/> +3.2% vs juin</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">✨ Profit net</div>
              <div className="text-2xl font-mono font-bold text-success mb-1">{formatCurrency(netProfit)}</div>
              <div className="text-xs text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +18.7% vs juin</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">⏳ À encaisser</div>
              <div className="text-2xl font-mono font-bold text-warning mb-1">{formatCurrency(14800)}</div>
              <div className="text-xs text-warning bg-warning-bg inline-flex px-1.5 py-0.5 rounded mt-1">3 factures</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenus List */}
            <Card className="flex flex-col">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <span className="text-lg">💰</span> <h3 className="font-semibold">Revenus récents</h3>
              </div>
              <div className="divide-y divide-border/50">
                {revenues.map(r => (
                  <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
                      <Euro className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.date}</div>
                    </div>
                    <div className="font-mono font-semibold text-success shrink-0">+{formatCurrency(r.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dépenses List */}
            <Card className="flex flex-col">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <span className="text-lg">📉</span> <h3 className="font-semibold">Dépenses récentes</h3>
              </div>
              <div className="divide-y divide-border/50">
                {expenses.map(ex => (
                  <div key={ex.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-danger-bg text-danger flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ex.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ex.date} · {ex.category || 'Général'}</div>
                    </div>
                    <div className="font-mono font-semibold text-danger shrink-0">-{formatCurrency(ex.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant={formData.type === 'revenue' ? 'primary' : 'outline'} onClick={() => setFormData({...formData, type: 'revenue'})}>Revenu</Button>
            <Button type="button" variant={formData.type === 'expense' ? 'primary' : 'outline'} onClick={() => setFormData({...formData, type: 'expense'})}>Dépense</Button>
          </div>
          <div><Label>Description</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ex: Acompte Client" /></div>
          <div><Label>Montant (€)</Label><Input type="number" required value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="1500" /></div>
          <div><Label>Date</Label><Input required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} placeholder="15 juillet 2025" /></div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addTx.isPending}>{addTx.isPending ? "Ajout..." : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

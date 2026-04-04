import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Button, Input, Modal, Label } from "@/components/UI";
import { useFinances, useAddTransaction } from "@/hooks/use-finances";
import { useInvoices } from "@/hooks/use-invoices";
import { Plus, ArrowUpRight, ArrowDownRight, Euro, UploadCloud } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Finances() {
  const { data: transactions = [] } = useFinances();
  const { data: invoices = [] } = useInvoices();
  const addTx = useAddTransaction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "revenue",
    name: "",
    amount: "",
    date: "",
    category: "",
  });

  const revenues = transactions.filter(t => t.type === "revenue");
  const expenses = transactions.filter(t => t.type === "expense");

  const totalRev = revenues.reduce((acc, t) => acc + t.amount, 0);
  const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRev - totalExp;

  // Factures en attente depuis les vraies données
  const pendingInvoices = invoices.filter(i => i.status === "En attente" || i.status === "En retard");
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

  const currentMonth = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTx.mutate(
      {
        type: formData.type as "revenue" | "expense",
        name: formData.name,
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category || undefined,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ type: "revenue", name: "", amount: "", date: "", category: "" });
        },
      }
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Finances"
        subtitle={`${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} · Profit net : ${formatCurrency(netProfit)}`}
      >
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Revenus</div>
              <div className="text-2xl font-mono font-bold text-success mb-1">{formatCurrency(totalRev)}</div>
              <div className="text-xs text-success flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Total cumulé
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Dépenses</div>
              <div className="text-2xl font-mono font-bold text-danger mb-1">{formatCurrency(totalExp)}</div>
              <div className="text-xs text-danger flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Total cumulé
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Profit net</div>
              <div className={`text-2xl font-mono font-bold mb-1 ${netProfit >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(netProfit)}
              </div>
              <div className={`text-xs flex items-center gap-1 ${netProfit >= 0 ? "text-success" : "text-danger"}`}>
                {netProfit >= 0
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />
                }
                Revenus − Dépenses
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">À encaisser</div>
              <div className="text-2xl font-mono font-bold text-warning mb-1">{formatCurrency(pendingAmount)}</div>
              <div className="text-xs text-warning bg-warning/10 inline-flex px-1.5 py-0.5 rounded mt-1">
                {pendingInvoices.length} facture{pendingInvoices.length > 1 ? "s" : ""}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenus */}
            <Card className="flex flex-col">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <Euro className="w-4 h-4 text-success" />
                <h3 className="font-semibold">Revenus</h3>
                <span className="ml-auto text-xs text-muted-foreground">{revenues.length} entrée{revenues.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border/50">
                {revenues.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Aucun revenu enregistré
                  </div>
                ) : revenues.map(r => (
                  <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                      <Euro className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.date}{r.category ? ` · ${r.category}` : ""}</div>
                    </div>
                    <div className="font-mono font-semibold text-success shrink-0">+{formatCurrency(r.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dépenses */}
            <Card className="flex flex-col">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-danger" />
                <h3 className="font-semibold">Dépenses</h3>
                <span className="ml-auto text-xs text-muted-foreground">{expenses.length} entrée{expenses.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border/50">
                {expenses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Aucune dépense enregistrée
                  </div>
                ) : expenses.map(ex => (
                  <div key={ex.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ex.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ex.date} · {ex.category || "Général"}</div>
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
            <Button
              type="button"
              variant={formData.type === "revenue" ? "primary" : "outline"}
              onClick={() => setFormData({ ...formData, type: "revenue" })}
            >
              Revenu
            </Button>
            <Button
              type="button"
              variant={formData.type === "expense" ? "primary" : "outline"}
              onClick={() => setFormData({ ...formData, type: "expense" })}
            >
              Dépense
            </Button>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Acompte Client"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Montant (€)</Label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1500"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="15 juillet 2025"
              />
            </div>
          </div>
          <div>
            <Label>Catégorie <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
            <Input
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Logiciels, Personnel, Marketing…"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addTx.isPending}>
              {addTx.isPending ? "Ajout..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

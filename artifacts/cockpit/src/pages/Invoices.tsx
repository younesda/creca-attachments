import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label } from "@/components/UI";
import { useInvoices, useAddInvoice } from "@/hooks/use-invoices";
import { Plus, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Invoices() {
  const { data: invoices = [] } = useInvoices();
  const addInvoice = useAddInvoice();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ client: "", desc: "", amount: "", date: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvoice.mutate({ ...formData, amount: Number(formData.amount) }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ client: "", desc: "", amount: "", date: "" });
        toast({ title: "Facture créée avec succès" });
      }
    });
  };

  const pending = invoices.filter(i => i.status === 'En attente' || i.status === 'En retard');
  const pendingAmount = pending.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Factures" subtitle={`${invoices.length} factures · ${pending.length} en attente · ${formatCurrency(pendingAmount)} à encaisser`}>
        <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Export PDF généré", description: "Le téléchargement va commencer." })}><Download className="w-4 h-4"/> Exporter PDF</Button>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4"/> Nouvelle facture</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto">
          
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border bg-[#0D0D15] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div>Facture</div>
              <div>Montant</div>
              <div>Échéance</div>
              <div>Statut</div>
            </div>
            <div className="divide-y divide-border/50">
              {invoices.map(inv => (
                <div key={inv.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer">
                  <div>
                    <div className="font-semibold text-sm">{inv.ref}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{inv.client} · {inv.desc}</div>
                  </div>
                  <div className="font-mono font-semibold">{formatCurrency(inv.amount)}</div>
                  <div className="text-sm text-muted-foreground">{inv.date}</div>
                  <div><Badge variant={inv.statusColor}>{inv.status}</Badge></div>
                </div>
              ))}
            </div>
          </Card>

        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Facture">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Client</Label><Input required value={formData.client} onChange={e=>setFormData({...formData, client: e.target.value})} placeholder="Ex: NovaTech" /></div>
          <div><Label>Description / Objet</Label><Input required value={formData.desc} onChange={e=>setFormData({...formData, desc: e.target.value})} placeholder="Ex: Solde Phase 1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Montant HT (€)</Label><Input type="number" required value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} placeholder="1500" /></div>
            <div><Label>Échéance</Label><Input required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} placeholder="15/08/2025" /></div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addInvoice.isPending}>{addInvoice.isPending ? "Génération..." : "Générer la facture"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

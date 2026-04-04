import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label } from "@/components/UI";
import { useInvoices, useAddInvoice } from "@/hooks/use-invoices";
import { useClients } from "@/hooks/use-clients";
import { useAuth } from "@/contexts/AuthContext";
import { isAtLimit } from "@/lib/plan-limits";
import { Plus, Download, Lock, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Invoices() {
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();
  const addInvoice = useAddInvoice();
  const { plan } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    desc: "",
    amount: "",
    date: "",
  });

  const atLimit = isAtLimit(plan, "invoices", invoices.length);
  const canExportCsv = plan === "pro" || plan === "business";
  const canExportPdf = plan === "business";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === formData.clientId);
    addInvoice.mutate(
      {
        clientId: formData.clientId || undefined,
        client: selectedClient?.name ?? formData.clientId,
        desc: formData.desc,
        amount: Number(formData.amount),
        date: formData.date,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ clientId: "", desc: "", amount: "", date: "" });
          toast({ title: "Facture créée avec succès" });
        },
      }
    );
  };

  const pending = invoices.filter(i => i.status === "En attente" || i.status === "En retard");
  const pendingAmount = pending.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Factures"
        subtitle={`${invoices.length} facture${invoices.length > 1 ? "s" : ""} · ${pending.length} en attente · ${formatCurrency(pendingAmount)} à encaisser`}
      >
        {canExportCsv ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast({ title: "Export CSV généré", description: "Téléchargement en cours…" })}
          >
            <FileText className="w-4 h-4" /> CSV
          </Button>
        ) : (
          <Button variant="outline" className="gap-2 opacity-40 cursor-not-allowed" title="Disponible dès le Plan Pro">
            <Lock className="w-3 h-3" /> CSV
          </Button>
        )}

        {canExportPdf ? (
          <Button
            variant="outline"
            className="gap-2 border-amber-500/40 text-amber-400 hover:border-amber-400"
            onClick={() => toast({ title: "Export PDF généré", description: "Téléchargement en cours…" })}
          >
            <Download className="w-4 h-4" /> PDF
          </Button>
        ) : (
          <Link href="/">
            <Button variant="outline" className="gap-2 opacity-40" title="Disponible dès le Plan Business">
              <Lock className="w-3 h-3" /> PDF
            </Button>
          </Link>
        )}

        {atLimit ? (
          <Link href="/">
            <Button variant="outline" className="gap-2 border-amber-500/40 text-amber-400 hover:border-amber-400">
              <Lock className="w-4 h-4" /> Limite atteinte ({invoices.length}/5)
            </Button>
          </Link>
        ) : (
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nouvelle facture
            {plan === "free" && (
              <span className="text-[10px] opacity-60 ml-1">({invoices.length}/5)</span>
            )}
          </Button>
        )}
      </PageHeader>

      {atLimit && (
        <div className="mx-8 mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between shrink-0">
          <span className="text-sm text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Plan Free — 5 factures maximum
          </span>
          <Link href="/">
            <span className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">
              Passer Pro — factures illimitées
            </span>
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border bg-[#0D0D15] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div>Facture</div>
              <div>Montant</div>
              <div>Échéance</div>
              <div>Statut</div>
            </div>
            <div className="divide-y divide-border/50">
              {invoices.map(inv => (
                <div
                  key={inv.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-sm">{inv.ref}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {inv.client} · {inv.desc}
                    </div>
                  </div>
                  <div className="font-mono font-semibold">{formatCurrency(inv.amount)}</div>
                  <div className="text-sm text-muted-foreground">{inv.date}</div>
                  <div>
                    <Badge variant={inv.statusColor}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Facture">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Client</Label>
            {clients.length > 0 ? (
              <select
                required
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="Ajoutez d'abord un client dans l'onglet Clients"
                disabled
              />
            )}
          </div>
          <div>
            <Label>Description / Objet</Label>
            <Input
              required
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Ex: Solde Phase 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Montant HT (€)</Label>
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
              <Label>Échéance</Label>
              <Input
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="15/08/2025"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addInvoice.isPending}>
              {addInvoice.isPending ? "Génération..." : "Générer la facture"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label } from "@/components/UI";
import { useClients, useAddClient, useDeleteClient } from "@/hooks/use-clients";
import { useAuth } from "@/contexts/AuthContext";
import { isAtLimit } from "@/lib/plan-limits";
import { Search, Plus, Mail, Phone, MapPin, Lock, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Clients() {
  const { data: clients = [] } = useClients();
  const addClient = useAddClient();
  const deleteClient = useDeleteClient();
  const { plan } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", sector: "", email: "", phone: "", city: "" });

  const filteredClients = search.trim()
    ? clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.sector.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  const atLimit = isAtLimit(plan, "clients", clients.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: "", sector: "", email: "", phone: "", city: "" });
      }
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Clients" subtitle={`${clients.length} client${clients.length > 1 ? "s" : ""} actif${clients.length > 1 ? "s" : ""}`}>
        <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5 w-64">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {atLimit ? (
          <Link href="/">
            <Button variant="outline" className="gap-2 border-amber-500/40 text-amber-400 hover:border-amber-400">
              <Lock className="w-4 h-4" /> Limite atteinte
            </Button>
          </Link>
        ) : (
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nouveau client
          </Button>
        )}
      </PageHeader>

      {atLimit && (
        <div className="mx-8 mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between shrink-0">
          <span className="text-sm text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Plan Free — 1 client maximum
          </span>
          <Link href="/?scroll=pricing">
            <span className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">
              Passer Pro — illimité
            </span>
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredClients.map(c => (
            <Card key={c.id} className="p-5 hover:-translate-y-1 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center font-bold text-white shadow-lg`}>
                  {c.initials}
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.sector}</div>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5"/> {c.email}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5"/> {c.phone}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> {c.city}</div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <Badge variant={c.statusColor}>{c.statusText}</Badge>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm font-semibold text-success">{c.revenue !== null ? formatCurrency(c.revenue) : "—"}</div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteClient.mutate(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {!atLimit && (
            <Card
              className="p-5 border-dashed border-2 flex flex-col items-center justify-center gap-3 min-h-[220px] cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Ajouter un client</div>
            </Card>
          )}

          {atLimit && (
            <Link href="/">
              <Card className="p-5 border-dashed border-2 border-amber-500/30 flex flex-col items-center justify-center gap-3 min-h-[220px] cursor-pointer hover:border-amber-400/50 hover:bg-amber-500/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-amber-400">Passer Pro pour débloquer</div>
              </Card>
            </Link>
          )}

        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Nom de l'entreprise</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ex: Studio K" /></div>
          <div><Label>Secteur d'activité</Label><Input required value={formData.sector} onChange={e=>setFormData({...formData, sector: e.target.value})} placeholder="Ex: Design" /></div>
          <div><Label>Email</Label><Input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="contact@..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Téléphone</Label><Input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="+33..." /></div>
            <div><Label>Ville</Label><Input value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} placeholder="Paris" /></div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addClient.isPending}>{addClient.isPending ? "Création..." : "Créer le client"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

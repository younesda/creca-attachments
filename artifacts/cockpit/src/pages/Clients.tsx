import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label } from "@/components/UI";
import { useClients, useAddClient } from "@/hooks/use-clients";
import { Search, Plus, Mail, Phone, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Clients() {
  const { data: clients = [] } = useClients();
  const addClient = useAddClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", sector: "", email: "", phone: "", city: "" });

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
      <PageHeader title="Clients" subtitle={`${clients.length} clients actifs`}>
        <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5 w-64">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground" placeholder="Rechercher un client..." />
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4"/> Nouveau client</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {clients.map(c => (
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
                <div className="font-mono text-sm font-semibold text-success">{c.revenue !== null ? formatCurrency(c.revenue) : "—"}</div>
              </div>
            </Card>
          ))}

          <Card 
            className="p-5 border-dashed border-2 flex flex-col items-center justify-center gap-3 min-h-[220px] cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">Ajouter un client</div>
          </Card>

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

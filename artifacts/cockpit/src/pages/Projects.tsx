import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label, Progress } from "@/components/UI";
import { useProjects, useAddProject } from "@/hooks/use-projects";
import { Filter, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Projects() {
  const { data: projects = [] } = useProjects();
  const addProject = useAddProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", client: "", budget: "", dates: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject.mutate({ ...formData, budget: Number(formData.budget) }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: "", client: "", budget: "", dates: "" });
      }
    });
  };

  const statusCounts = {
    en_cours: projects.filter(p => p.status === 'En cours').length,
    termines: projects.filter(p => p.status === 'Terminé').length,
    pause: projects.filter(p => p.status === 'En pause').length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Projets" subtitle={`${statusCounts.en_cours} en cours · ${statusCounts.termines} terminés · ${statusCounts.pause} en pause`}>
        <Button variant="outline" className="gap-2"><Filter className="w-4 h-4"/> Filtrer</Button>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4"/> Nouveau projet</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto">
          
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-semibold">Tous les projets</h3>
              <div className="flex gap-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info"></span> En cours ({statusCounts.en_cours})</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Terminés ({statusCounts.termines})</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning"></span> Pause ({statusCounts.pause})</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/[0.01]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nom du projet</th>
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-6 py-4 font-semibold">Budget</th>
                    <th className="px-6 py-4 font-semibold">Dates</th>
                    <th className="px-6 py-4 font-semibold">Statut</th>
                    <th className="px-6 py-4 font-semibold">Avancement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.client}</td>
                      <td className="px-6 py-4 font-mono">{formatCurrency(p.budget)}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{p.dates}</td>
                      <td className="px-6 py-4"><Badge variant={p.statusColor}>{p.status}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1"><Progress value={p.progress} color={`var(--color-${p.statusColor})`} /></div>
                          <span className="text-xs font-mono text-muted-foreground w-8 text-right">{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Projet">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Nom du projet</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ex: Refonte Site Web" /></div>
          <div><Label>Client</Label><Input required value={formData.client} onChange={e=>setFormData({...formData, client: e.target.value})} placeholder="Ex: Studio K" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Budget (€)</Label><Input type="number" required value={formData.budget} onChange={e=>setFormData({...formData, budget: e.target.value})} placeholder="5000" /></div>
            <div><Label>Période</Label><Input required value={formData.dates} onChange={e=>setFormData({...formData, dates: e.target.value})} placeholder="01/09 → 30/10" /></div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addProject.isPending}>{addProject.isPending ? "Création..." : "Créer le projet"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

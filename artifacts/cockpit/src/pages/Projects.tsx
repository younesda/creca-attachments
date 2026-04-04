import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label, Progress } from "@/components/UI";
import { useProjects, useAddProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useClients } from "@/hooks/use-clients";
import { useAuth } from "@/contexts/AuthContext";
import { isAtLimit } from "@/lib/plan-limits";
import { Search, Plus, Lock, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Projects() {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { plan } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    budget: "",
    dates: "",
  });

  const filteredProjects = projects.filter(p => {
    const matchSearch = !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tous" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const atLimit = isAtLimit(plan, "projects", projects.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject.mutate(
      {
        name: formData.name,
        clientId: formData.clientId || undefined,
        client: clients.find(c => c.id === formData.clientId)?.name ?? formData.clientId,
        budget: Number(formData.budget),
        dates: formData.dates,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ name: "", clientId: "", budget: "", dates: "" });
        },
      }
    );
  };

  const statusCounts = {
    en_cours: projects.filter(p => p.status === "En cours").length,
    termines: projects.filter(p => p.status === "Terminé").length,
    pause: projects.filter(p => p.status === "En pause").length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader
        title="Projets"
        subtitle={`${statusCounts.en_cours} en cours · ${statusCounts.termines} terminés · ${statusCounts.pause} en pause`}
      >
        <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5 w-52">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-muted-foreground outline-none focus:border-primary"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="Tous">Tous</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminés</option>
          <option value="En pause">En pause</option>
        </select>
        {atLimit ? (
          <Link href="/">
            <Button variant="outline" className="gap-2 border-amber-500/40 text-amber-400 hover:border-amber-400">
              <Lock className="w-4 h-4" /> Limite atteinte
            </Button>
          </Link>
        ) : (
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Nouveau projet
          </Button>
        )}
      </PageHeader>

      {atLimit && (
        <div className="mx-8 mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between shrink-0">
          <span className="text-sm text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Plan Free — 1 projet maximum
          </span>
          <Link href="/">
            <span className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">
              Passer Pro — projets illimités
            </span>
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-semibold">Tous les projets</h3>
              <div className="flex gap-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-info" /> En cours ({statusCounts.en_cours})
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" /> Terminés ({statusCounts.termines})
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning" /> Pause ({statusCounts.pause})
                </span>
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
                  {filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.client}</td>
                      <td className="px-6 py-4 font-mono">{formatCurrency(p.budget)}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{p.dates}</td>
                      <td className="px-6 py-4">
                        <Badge variant={p.statusColor as "info" | "warning" | "success" | "muted"}>{p.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={p.progress} color={`var(--color-${p.statusColor})`} />
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={p.progress}
                            onChange={e => {
                              const v = Math.min(100, Math.max(0, Number(e.target.value)));
                              updateProject.mutate({ id: p.id, progress: v });
                            }}
                            className="w-12 text-xs font-mono text-muted-foreground bg-transparent border border-border rounded px-1 py-0.5 text-right focus:outline-none focus:border-primary"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteProject.mutate(p.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          <div>
            <Label>Nom du projet</Label>
            <Input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Refonte Site Web"
            />
          </div>
          <div>
            <Label>Client</Label>
            {clients.length > 0 ? (
              <select
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
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="Ajoutez d'abord un client"
                disabled
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget (FCFA)</Label>
              <Input
                type="number"
                required
                min="0"
                step="1"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div>
              <Label>Période</Label>
              <Input
                required
                value={formData.dates}
                onChange={e => setFormData({ ...formData, dates: e.target.value })}
                placeholder="01/09 → 30/10"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addProject.isPending}>
              {addProject.isPending ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

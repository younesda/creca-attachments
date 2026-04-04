import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageHeader } from "@/components/Layout";
import { Card, Badge, Button, Input, Modal, Label } from "@/components/UI";
import { useTasks, useToggleTask, useAddTask, useDeleteTask } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/AuthContext";
import { isAtLimit } from "@/lib/plan-limits";
import { Plus, Check, Calendar, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Tasks() {
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const addTask = useAddTask();
  const deleteTask = useDeleteTask();
  const { plan } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", date: "", priority: "Normal", priorityColor: "info" as any });

  const activeTasks = tasks.filter(t => t.status !== "done");
  const atLimit = isAtLimit(plan, "tasks", activeTasks.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: "", date: "", priority: "Normal", priorityColor: "info" });
      }
    });
  };

  const columns = [
    { id: 'todo', title: 'À faire', color: 'danger', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'En cours', color: 'warning', tasks: tasks.filter(t => t.status === 'in_progress') },
    { id: 'done', title: 'Terminées', color: 'success', tasks: tasks.filter(t => t.status === 'done') },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Tâches" subtitle={`${tasks.length} tâches · ${columns[0].tasks.filter(t=>t.priorityColor==='danger').length} urgentes aujourd'hui`}>
        {atLimit ? (
          <Link href="/">
            <Button variant="outline" className="gap-2 border-amber-500/40 text-amber-400 hover:border-amber-400">
              <Lock className="w-4 h-4" /> Limite atteinte ({activeTasks.length}/20)
            </Button>
          </Link>
        ) : (
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Ajouter
            {plan === "free" && <span className="text-[10px] opacity-60 ml-1">({activeTasks.length}/20)</span>}
          </Button>
        )}
      </PageHeader>

      {atLimit && (
        <div className="mx-8 mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between shrink-0">
          <span className="text-sm text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Plan Free — 20 tâches actives maximum
          </span>
          <Link href="/">
            <span className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer">
              Passer Pro — illimité
            </span>
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-x-auto p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex gap-6 min-w-max h-full">

          {columns.map(col => (
            <Card key={col.id} className="w-80 flex flex-col h-full bg-[#121218]/80 border-border/50">
              <div className="p-4 border-b border-border/50 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <Badge variant={col.color as any}>{col.tasks.length}</Badge>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {col.tasks.map(t => (
                  <div key={t.id} className="bg-card border border-border p-3 rounded-lg hover:border-primary/50 transition-colors group shadow-sm relative">
                    <button
                      onClick={() => deleteTask.mutate(t.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleTask.mutate(t.id)}>
                      <div className={cn("mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0",
                        t.status === "done" ? "bg-success border-success" :
                        t.status === "in_progress" ? "bg-warning-bg border-warning" :
                        "border-muted-foreground group-hover:border-primary")}>
                        {t.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <div className={cn("text-sm font-medium leading-snug mb-2 transition-colors", t.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                          {t.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> {t.date}</span>
                          <Badge variant={t.priorityColor as any} className="text-[10px] px-1.5 py-0.5">{t.priority}</Badge>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
                {col.tasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Aucune tâche
                  </div>
                )}
              </div>
            </Card>
          ))}

        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Tâche">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Description</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Que devez-vous faire ?" /></div>
          <div><Label>Échéance</Label><Input required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} placeholder="Aujourd'hui, Demain..." /></div>
          <div>
            <Label>Priorité</Label>
            <select
              required className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.priority}
              onChange={e => {
                const val = e.target.value;
                const color = val === 'Urgent' ? 'danger' : val === 'Haute' ? 'warning' : 'info';
                setFormData({...formData, priority: val, priorityColor: color});
              }}
            >
              <option value="Normal">Normale</option>
              <option value="Haute">Haute</option>
              <option value="Urgent">Urgente</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={addTask.isPending}>{addTask.isPending ? "Ajout..." : "Ajouter la tâche"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

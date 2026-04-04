import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card } from "@/components/UI";
import { Files, FolderOpen, FileText, ImageIcon, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Documents() {
  const { plan } = useAuth();
  const isAvailable = plan === "pro" || plan === "business";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Documents" subtitle="Stockage et gestion de vos fichiers" />

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {!isAvailable ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display mb-2">Module Documents</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Stockez et organisez vos contrats, devis et fichiers clients.<br />
                  Disponible dès le Plan Pro.
                </p>
              </div>
              <div className="flex gap-3 mt-2 flex-wrap justify-center text-sm text-muted-foreground">
                {["Contrats PDF", "Devis signés", "Photos", "Exports"].map((f, i) => (
                  <span key={i} className="px-3 py-1.5 bg-card border border-border rounded-lg">{f}</span>
                ))}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: FolderOpen, label: "Contrats", count: 0, color: "text-primary" },
                  { icon: FileText, label: "Devis", count: 0, color: "text-success" },
                  { icon: ImageIcon, label: "Médias", count: 0, color: "text-warning" },
                ].map((cat, i) => (
                  <Card key={i} className="p-5 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center ${cat.color}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.count} fichier{cat.count !== 1 ? "s" : ""}</div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-16 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-colors">
                <Files className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, images, documents — 50 Go inclus</p>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

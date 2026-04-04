import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/Layout";
import { Card, Button, Input, Label } from "@/components/UI";
import { useProfile, useSaveProfile } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/AuthContext";
import { useUpgrade } from "@/hooks/use-upgrade";
import { Save, Check, Building2, Mail, Phone, MapPin, FileText, Globe } from "lucide-react";

type ProfileForm = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  rccm: string;
  taxId: string;
  website: string;
};

const EMPTY: ProfileForm = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  rccm: "",
  taxId: "",
  website: "",
};

export default function Settings() {
  const { user, plan } = useAuth();
  const { data: profile, isLoading: loading } = useProfile();
  const saveProfile = useSaveProfile();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...EMPTY, ...profile });
  }, [profile]);

  const handleChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile.mutate({ ...form, onboardingCompleted: true }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  const PLAN_LABELS: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    business: "Business",
  };

  const PLAN_COLORS: Record<string, string> = {
    free: "text-muted-foreground bg-muted/30 border-border",
    pro: "text-primary bg-primary/10 border-primary/30",
    business: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader title="Paramètres" subtitle="Profil entreprise & informations de facturation" />

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Compte */}
          <Card className="p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Compte</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                {(user?.email?.[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{user?.email}</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${PLAN_COLORS[plan]}`}>
                  ✦ Plan {PLAN_LABELS[plan]}
                </span>
              </div>
            </div>
          </Card>

          {/* Profil entreprise */}
          <form onSubmit={handleSubmit}>
            <Card className="p-6">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6">Profil entreprise</h2>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted/20 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>
                      <Building2 className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                      Nom de l'entreprise
                    </Label>
                    <Input
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                      placeholder="Ex: Studio Créca"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <Mail className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                        Email professionnel
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="contact@entreprise.com"
                      />
                    </div>
                    <div>
                      <Label>
                        <Phone className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                        Téléphone
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={handleChange("phone")}
                        placeholder="+225 07 00 00 00 00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      <MapPin className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                      Adresse
                    </Label>
                    <Input
                      value={form.address}
                      onChange={handleChange("address")}
                      placeholder="Ex: Plateau, Abidjan, Côte d'Ivoire"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <FileText className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                        RCCM
                      </Label>
                      <Input
                        value={form.rccm}
                        onChange={handleChange("rccm")}
                        placeholder="Ex: CI-ABJ-2024-B-12345"
                      />
                    </div>
                    <div>
                      <Label>
                        <FileText className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                        N° Contribuable (DGI)
                      </Label>
                      <Input
                        value={form.taxId}
                        onChange={handleChange("taxId")}
                        placeholder="Ex: 0012345678"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      <Globe className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                      Site web
                    </Label>
                    <Input
                      value={form.website}
                      onChange={handleChange("website")}
                      placeholder="https://monentreprise.com"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={saveProfile.isPending || loading} className="gap-2 min-w-[140px]">
                  {saved ? (
                    <><Check className="w-4 h-4" /> Sauvegardé</>
                  ) : saveProfile.isPending ? (
                    "Enregistrement…"
                  ) : (
                    <><Save className="w-4 h-4" /> Enregistrer</>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

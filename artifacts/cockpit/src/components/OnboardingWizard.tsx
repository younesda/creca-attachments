import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Label } from "@/components/UI";
import { useSaveProfile } from "@/hooks/use-profile";
import { Building2, Mail, Phone, MapPin, FileText, ChevronRight, Check, Sparkles } from "lucide-react";

type Fields = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  rccm: string;
  taxId: string;
};

const EMPTY: Fields = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  rccm: "",
  taxId: "",
};

const STEPS = [
  { id: "welcome", label: "Bienvenue" },
  { id: "company", label: "Entreprise" },
  { id: "contact", label: "Contact" },
  { id: "legal", label: "Légal" },
  { id: "done", label: "Prêt" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Fields>(EMPTY);
  const saveProfile = useSaveProfile();

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const next = () => setStep(s => s + 1);

  const finish = () => {
    setStep(4);
    saveProfile.mutate({
      ...form,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`transition-all duration-300 rounded-full ${
              i === step
                ? "w-6 h-2 bg-primary"
                : i < step
                  ? "w-2 h-2 bg-primary/50"
                  : "w-2 h-2 bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* Step 0 — Bienvenue */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display mb-3">Bienvenue sur Cockpit</h1>
                <p className="text-muted-foreground">
                  Prenons 2 minutes pour configurer votre espace de travail. Vous pourrez tout modifier plus tard dans les paramètres.
                </p>
              </div>
              <Button size="lg" className="w-full gap-2" onClick={next}>
                Commencer <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 1 — Entreprise */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display mb-1">Votre entreprise</h2>
                <p className="text-sm text-muted-foreground">Comment s'appelle votre entreprise ?</p>
              </div>
              <div>
                <Label><Building2 className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />Nom de l'entreprise</Label>
                <Input
                  autoFocus
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="Ex: Studio Créca"
                  className="text-lg py-3"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                  Retour
                </Button>
                <Button className="flex-1 gap-2" onClick={next} disabled={!form.companyName.trim()}>
                  Suivant <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display mb-1">Coordonnées</h2>
                <p className="text-sm text-muted-foreground">Vos informations de contact professionnelles.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label><Mail className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />Email professionnel</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="contact@monentreprise.com"
                  />
                </div>
                <div>
                  <Label><Phone className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />Téléphone</Label>
                  <Input
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>
                <div>
                  <Label><MapPin className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />Adresse</Label>
                  <Input
                    value={form.address}
                    onChange={set("address")}
                    placeholder="Ex: Plateau, Abidjan, Côte d'Ivoire"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                  Retour
                </Button>
                <Button className="flex-1 gap-2" onClick={next}>
                  Suivant <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Légal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display mb-1">Informations légales</h2>
                <p className="text-sm text-muted-foreground">Optionnel — utilisé sur vos factures.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label><FileText className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />RCCM</Label>
                  <Input
                    value={form.rccm}
                    onChange={set("rccm")}
                    placeholder="Ex: CI-ABJ-2024-B-12345"
                  />
                </div>
                <div>
                  <Label><FileText className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />N° Contribuable (DGI)</Label>
                  <Input
                    value={form.taxId}
                    onChange={set("taxId")}
                    placeholder="Ex: 0012345678"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                  Retour
                </Button>
                <Button variant="ghost" className="flex-1" onClick={finish} disabled={saveProfile.isPending}>
                  Passer
                </Button>
                <Button className="flex-1 gap-2" onClick={finish} disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? "Enreg…" : <><Check className="w-4 h-4" /> Terminer</>}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 — Done (shown briefly before wizard closes via query invalidation) */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display mb-2">Tout est prêt !</h2>
                <p className="text-muted-foreground">Votre espace est configuré. Bonne gestion !</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

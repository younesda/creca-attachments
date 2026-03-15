import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button, Badge } from "@/components/UI";
import { CheckCircle2, ChevronRight, BarChart3, Users, FolderKanban, Receipt, BrainCircuit, CreditCard, CircleDollarSign, CheckSquare } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)]"></span>
            Cockpit
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/app')}>Se connecter</Button>
            <Button onClick={() => setLocation('/app')}>Démarrer gratuitement</Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 text-center pt-10 pb-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold mb-8">
              ✦ Le cockpit des entrepreneurs
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] mb-6">
              Pilotez toute votre entreprise <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">depuis un seul endroit</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Finances, clients, projets, tâches, documents et analytics. Tout ce dont vous avez besoin pour faire tourner votre business, réuni en une seule plateforme.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" onClick={() => setLocation('/app')} className="w-full sm:w-auto text-lg px-8">
                Commencer — c'est gratuit
              </Button>
              <Button variant="outline" size="lg" onClick={() => setLocation('/app')} className="w-full sm:w-auto text-lg px-8 gap-2">
                Voir la démo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border/50">
              {[
                { n: "2 400+", l: "Entrepreneurs" },
                { n: "98%", l: "Satisfaction" },
                { n: "12h", l: "Gagnées / semaine" },
                { n: "4.9★", l: "Note moyenne" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold font-display text-foreground">{stat.n}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Dashboard Preview Mockup */}
        <section className="max-w-6xl mx-auto px-6 mb-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-2xl border border-border bg-[#0D0D15] shadow-2xl shadow-primary/10 overflow-hidden cursor-pointer group"
            onClick={() => setLocation('/app')}
          >
            <div className="h-10 bg-[#16161F] border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28CA41]"></div>
              <div className="mx-auto bg-background px-4 py-1 rounded text-xs text-muted-foreground font-mono">app.cockpit.io/dashboard</div>
            </div>
            <div className="h-[400px] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent flex items-end justify-center pb-8">
                 <div className="text-primary font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                    <ChevronRight className="w-5 h-5" /> Cliquez pour explorer l'application complète
                 </div>
              </div>
              {/* Fake UI simple rendering to look like dashboard */}
              <div className="flex h-full pointer-events-none">
                <div className="w-48 bg-sidebar border-r border-border p-4 space-y-2 opacity-50">
                  <div className="h-4 w-20 bg-border rounded mb-6"></div>
                  <div className="h-6 w-full bg-primary/20 rounded"></div>
                  <div className="h-6 w-3/4 bg-border/50 rounded"></div>
                  <div className="h-6 w-5/6 bg-border/50 rounded"></div>
                  <div className="h-6 w-full bg-border/50 rounded"></div>
                </div>
                <div className="flex-1 p-6 space-y-4 opacity-50">
                  <div className="h-8 w-40 bg-border rounded mb-6"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-24 bg-card rounded-lg border border-border"></div>
                    <div className="h-24 bg-card rounded-lg border border-border"></div>
                    <div className="h-24 bg-card rounded-lg border border-border"></div>
                    <div className="h-24 bg-card rounded-lg border border-border"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-40 col-span-2 bg-card rounded-lg border border-border"></div>
                    <div className="h-40 bg-card rounded-lg border border-border"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-32 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="muted" className="mb-4">Modules</Badge>
            <h2 className="text-4xl font-bold font-display mb-4">Tout ce qu'il vous faut,<br/>rien de superflu</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Chaque module a été conçu pour les besoins réels des entrepreneurs indépendants et petites équipes.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CircleDollarSign, title: "Finances & Comptabilité", desc: "Suivez revenus et dépenses en temps réel. Visualisez votre trésorerie et anticipez vos prévisions." },
              { icon: Users, title: "CRM Clients", desc: "Gérez vos contacts, l'historique de chaque relation et l'ensemble des échanges par client." },
              { icon: FolderKanban, title: "Gestion de Projets", desc: "Planifiez, budgétisez et suivez vos projets du premier devis à la livraison finale." },
              { icon: CheckSquare, title: "Tâches & Agenda", desc: "Kanban intuitif, priorités et rappels. Ne laissez plus rien tomber entre les mailles du filet." },
              { icon: Receipt, title: "Facturation", desc: "Créez et envoyez des devis et factures professionnels en quelques clics. Export PDF inclus." },
              { icon: BrainCircuit, title: "Intelligence Artificielle", desc: "Analyses financières, recommandations business et prévisions de revenus intelligentes." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-5xl mx-auto px-6 mb-32 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="muted" className="mb-4">Tarifs</Badge>
            <h2 className="text-4xl font-bold font-display">Commencez gratuitement,<br/>scalez quand vous êtes prêt</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-medium mb-2">Free</h3>
              <div className="text-4xl font-display font-bold mb-2">0€ <span className="text-base font-sans text-muted-foreground font-normal">/ mois</span></div>
              <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">Pour tester et démarrer.</p>
              <ul className="space-y-3 mb-8 text-sm">
                {["2 clients actifs", "3 projets simultanés", "10 factures / mois", "5 Go de stockage", "Dashboard de base"].map((f,i)=>(
                  <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/app')}>Commencer gratuitement</Button>
            </div>
            
            {/* Pro */}
            <div className="bg-card border-2 border-primary rounded-2xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-primary/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                ⭐ Le plus populaire
              </div>
              <h3 className="text-xl font-medium mb-2">Pro</h3>
              <div className="text-4xl font-display font-bold mb-2">29€ <span className="text-base font-sans text-muted-foreground font-normal">/ mois</span></div>
              <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">Pour les entrepreneurs actifs.</p>
              <ul className="space-y-3 mb-8 text-sm">
                {["Clients illimités", "Projets illimités", "Factures illimitées", "50 Go de stockage", "Analytics avancés", "IA — analyses & prévisions"].map((f,i)=>(
                  <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => setLocation('/app')}>Choisir Pro</Button>
            </div>

            {/* Business */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-medium mb-2">Business</h3>
              <div className="text-4xl font-display font-bold mb-2">79€ <span className="text-base font-sans text-muted-foreground font-normal">/ mois</span></div>
              <p className="text-sm text-muted-foreground mb-6 pb-6 border-b border-border">Pour les équipes en croissance.</p>
              <ul className="space-y-3 mb-8 text-sm">
                {["Tout Pro inclus", "Jusqu'à 10 membres", "API & intégrations", "200 Go de stockage", "Support prioritaire", "Compte dédié"].map((f,i)=>(
                  <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/app')}>Choisir Business</Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 relative z-10">Prêt à prendre le contrôle<br/>de votre business ?</h2>
            <p className="text-muted-foreground mb-8 relative z-10">Rejoignez 2 400+ entrepreneurs qui pilotent leur activité avec Cockpit.</p>
            <Button size="lg" className="relative z-10" onClick={() => setLocation('/app')}>Démarrer maintenant — gratuit</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-8 text-center">
        <div className="flex items-center justify-center gap-2 font-display font-bold text-lg mb-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span> Cockpit
        </div>
        <p className="text-sm text-muted-foreground">© 2025 Cockpit. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
